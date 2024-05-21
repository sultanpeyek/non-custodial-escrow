// Here we export some useful types and functions for interacting with the Anchor program.
import { PublicKey } from '@solana/web3.js';
import type { NonCustodialEscrow } from '../target/types/non_custodial_escrow';
import { IDL as NonCustodialEscrowIDL } from '../target/types/non_custodial_escrow';

// Re-export the generated IDL and type
export { NonCustodialEscrow, NonCustodialEscrowIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const programId = new PublicKey(
  'Jf6VVXdoNGacXL5TrKPKfomiLUAxzuJ7RwRtzYYYebu'
);
