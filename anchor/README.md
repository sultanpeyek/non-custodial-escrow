# Non Custodial Escrow

### Getting Started

- `npx create-solana-dapp@latest`
- set project name and basic anchor
- `cargo build`
- `pnpm install`
- Write on `lib.rs`

### Testing on Local

- `solana-test-validator`
- `solana logs`
- `solana confirm [tx signature] --verbose`
- `anchor test` or `anchor test -e localnet --skip-local-validator`

### Testing on Devnet

- `solana address ~/.config/solana/id.json`
- Fund that address by using [Faucet](https://faucet.solana.com)
- `anchor deploy --provider.cluster [your devnet rpc] --provider.wallet [your keypair]`
