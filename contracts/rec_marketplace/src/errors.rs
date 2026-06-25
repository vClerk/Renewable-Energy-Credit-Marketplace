use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RECError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    UnauthorizedProducer = 4,
    RECNotFound = 5,
    NotOwner = 6,
    InvalidStateTransition = 7,
    InvalidAmount = 8,
    InvalidPrice = 9,
    InvalidVintageYear = 10,
    NotListed = 11,
    InsufficientBalance = 12,
    InvalidFee = 13,
    InvalidRole = 14,
    ContractCallFailed = 15,
    UserNotFound = 16,
}
