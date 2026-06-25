# 🌿 REC Marketplace: Decentralized Renewable Energy Credits

A production-grade decentralized application (dApp) built on the **Stellar** blockchain using **Soroban** smart contracts. This platform enables the transparent issuance, trading, and retirement of Renewable Energy Credits (RECs).

![REC Marketplace Hero](https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200)

## 🏗️ Architecture

The system uses a dual-contract architecture for separation of concerns and security:

1.  **`rec_marketplace`**: Main logic for listing, trading, and lifecycle management.
2.  **`rec_registry`**: Handles Producer registration, Validator workflows, and Treasury (XLM payment processing).

### Technical Stack
-   **Smart Contracts**: Rust / Soroban (SDK v21)
-   **Frontend**: Next.js 15 (App Router, TypeScript)
-   **Styling**: Tailwind CSS + Custom Dark Green Glassmorphism
-   **State Management**: Zustand (Global UI/Wallet) & React Query (On-chain data)
-   **Wallet Integration**: `@creit.tech/stellar-wallets-kit`
-   **Observability**: Real-time event streaming & structured logging

## 🚀 Key Features

-   **Verified Issuance**: Producers can stake/issue RECs with detailed metadata (MWh, Vintage, Source).
-   **Role-Based Access (RBAC)**: Fine-grained permissions for Admins, Producers, and Validators.
-   **On-Chain Marketplace**: P2P trading with automated settlement in native XLM.
-   **Immutable Retirement**: Permanently "burn" RECs to generate verifiable sustainability certificates.
-   **Live Analytics**: Real-time tracking of marketplace volume and energy source distribution.

## 🛠️ Development Setup

### Prerequisites
-   [Rust & Cargo](https://rustup.rs/) (wasm32-unknown-unknown target)
-   [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup#install-stellar-cli)
-   [Node.js 20+](https://nodejs.org/)

### Smart Contract Development
```bash
# Build contracts
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test
```

### Frontend Development
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### Deployment
Use the provided PowerShell script for automated deployment:
```powershell
.\scripts\deploy.ps1 -network testnet
```

## 🔐 Security & Governance
-   **Storage**: Uses instance and persistent storage types to optimize ledger footprint.
-   **Fees**: Configurable platform fee (default 2.5%) redirected to the community treasury.
-   **Audit**: Every transaction is atomic; payments only release when REC ownership successfully transfers.

## 📄 License
MIT © 2024 REC Marketplace Team
