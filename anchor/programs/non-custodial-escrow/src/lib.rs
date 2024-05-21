use anchor_lang::prelude::*;

declare_id!("Jf6VVXdoNGacXL5TrKPKfomiLUAxzuJ7RwRtzYYYebu");

#[program]
pub mod non_custodial_escrow {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
