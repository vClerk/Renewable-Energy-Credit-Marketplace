use soroban_sdk::{Address, Env};
use crate::errors::RECError;
use crate::types::Role;
use crate::storage;

pub fn require_admin(env: &Env, caller: &Address) -> Result<(), RECError> {
    let admin = storage::get_admin(env);
    if *caller != admin {
        return Err(RECError::Unauthorized);
    }
    Ok(())
}

pub fn has_role(env: &Env, account: &Address, required_role: Role) -> Result<(), RECError> {
    // Admin has all roles
    let admin = storage::get_admin(env);
    if *account == admin {
        return Ok(());
    }
    match storage::get_role(env, account) {
        Some(role) if role == required_role => Ok(()),
        _ => Err(RECError::Unauthorized),
    }
}
