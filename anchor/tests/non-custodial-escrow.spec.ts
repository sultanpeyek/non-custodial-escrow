import * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import type NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as splToken from "@solana/spl-token";
import {
	LAMPORTS_PER_SOL,
	type PublicKey,
	SYSVAR_RENT_PUBKEY,
	SystemProgram,
} from "@solana/web3.js";
import type { NonCustodialEscrow } from "../target/types/non_custodial_escrow";

describe("non-custodial-escrow", () => {
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

	const program = anchor.workspace
		.NonCustodialEscrow as Program<NonCustodialEscrow>;

	const seller = provider.wallet.publicKey;
	const payer = (provider.wallet as NodeWallet).payer;

	const buyer = anchor.web3.Keypair.generate();
	console.log("Buyer ::", buyer.publicKey.toString());

	const escrowedXTokens = anchor.web3.Keypair.generate();
	console.log("escrowedXTokens ::", escrowedXTokens.publicKey.toString());

	let x_mint: PublicKey;
	let y_mint: PublicKey;
	let sellers_x_token: splToken.Account;
	let sellers_y_token: splToken.Account;
	let buyer_x_token: splToken.Account;
	let buyer_y_token: splToken.Account;
	let escrow: anchor.web3.PublicKey;

	beforeAll(
		async () => {
			await provider.connection.requestAirdrop(
				buyer.publicKey,
				1 * LAMPORTS_PER_SOL,
			);
			[escrow] = await anchor.web3.PublicKey.findProgramAddress(
				[anchor.utils.bytes.utf8.encode("escrow"), seller.toBuffer()],
				program.programId,
			);

			x_mint = await splToken.createMint(
				provider.connection,
				payer,
				provider.wallet.publicKey,
				provider.wallet.publicKey,
				6,
			);
			console.log("x_mint ::", x_mint.toString());

			y_mint = await splToken.createMint(
				provider.connection,
				payer,
				provider.wallet.publicKey,
				null,
				6,
			);
			console.log("y_mint ::", y_mint.toString());

			sellers_x_token = await splToken.getOrCreateAssociatedTokenAccount(
				provider.connection,
				payer,
				x_mint,
				seller,
				true,
			);
			console.log("sellers_x_token ::", sellers_x_token.address.toString());

			sellers_y_token = await splToken.getOrCreateAssociatedTokenAccount(
				provider.connection,
				payer,
				y_mint,
				seller,
				true,
			);
			console.log("sellers_y_token ::", sellers_y_token.address.toString());

			await splToken.mintTo(
				provider.connection,
				payer,
				x_mint,
				sellers_x_token.address,
				provider.wallet.publicKey,
				40,
			);

			await splToken.mintTo(
				provider.connection,
				payer,
				y_mint,
				sellers_y_token.address,
				provider.wallet.publicKey,
				40,
			);

			buyer_x_token = await splToken.getOrCreateAssociatedTokenAccount(
				provider.connection,
				payer,
				x_mint,
				buyer.publicKey,
				true,
			);
			console.log("buyer_x_token ::", buyer_x_token.address.toString());

			buyer_y_token = await splToken.getOrCreateAssociatedTokenAccount(
				provider.connection,
				payer,
				y_mint,
				buyer.publicKey,
				true,
			);

			console.log("buyer_y_token ::", buyer_y_token.address.toString());

			await splToken.mintTo(
				provider.connection,
				payer,
				x_mint,
				buyer_x_token.address,
				provider.wallet.publicKey,
				40,
			);

			await splToken.mintTo(
				provider.connection,
				payer,
				y_mint,
				buyer_y_token.address,
				provider.wallet.publicKey,
				40,
			);
		},
		5 * 60 * 1000,
	);

	it("Initialize Escrow", async () => {
		const x_amount = new anchor.BN(40);
		const y_amount = new anchor.BN(40);
		console.log("sellers_x_token ::", sellers_x_token);

		const tx = await program.methods
			.initialize(x_amount, y_amount)
			.accounts({
				seller: seller,
				xMint: x_mint,
				yMint: y_mint,
				escrow: escrow,
				sellerXToken: sellers_x_token.address,
				escrowedXTokens: escrowedXTokens.publicKey,
				systemProgram: SystemProgram.programId,
				tokenProgram: splToken.TOKEN_PROGRAM_ID,
				rent: SYSVAR_RENT_PUBKEY,
			})
			.signers([escrowedXTokens])
			.rpc({ skipPreflight: true });

		console.log("TxSig ::", tx);
	});

	it("Accept the trade", async () => {
		const tx = await program.methods
			.accept()
			.accounts({
				buyer: buyer.publicKey,
				escrow: escrow,
				escrowedXTokens: escrowedXTokens.publicKey,
				sellersYTokens: sellers_y_token.address,
				buyerXTokens: buyer_x_token.address,
				buyerYTokens: buyer_y_token.address,
				tokenProgram: splToken.TOKEN_PROGRAM_ID,
			})
			.signers([buyer])
			.rpc({ skipPreflight: true });

		console.log("TxSig ::", tx);
	});

	it("Cancel the trade", async () => {
		const tx = await program.methods
			.cancel()
			.accounts({
				seller: seller,
				escrow: escrow,
				escrowedXTokens: escrowedXTokens.publicKey,
				sellerXToken: sellers_x_token.address,
				tokenProgram: splToken.TOKEN_PROGRAM_ID,
			})
			.signers([payer])
			.rpc({ skipPreflight: true });

		console.log("TxSig ::", tx);
	});
});
