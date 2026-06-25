import {
  Contract,
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';

import {
  MARKETPLACE_CONTRACT_ID,
  REGISTRY_CONTRACT_ID,
  RPC_URL,
  HORIZON_URL,
  NETWORK_PASSPHRASE,
  BASE_FEE as APP_BASE_FEE,
} from './config';
import type {
  RECToken,
  RECEnergySource,
  Trade,
  MarketStats,
  Producer,
} from './types';

const server = new rpc.Server(RPC_URL, { allowHttp: false });

// ─── Helper: Producer Parse ──────────────────────────────────────────────────

function parseProducer(scVal: xdr.ScVal): Producer {
  const native = scValToNative(scVal) as Record<string, unknown>;
  return {
    address: native.address as string,
    name: native.name as string,
    location: native.location as string,
    energyTypes: (native.energy_types as string[] || []),
    capacityKw: Number(native.capacity_kw),
    certificationId: native.certification_id as string,
    status: (native.status as Record<string, unknown>
      ? Object.keys(native.status as object)[0]
      : 'Pending') as Producer['status'],
    registeredAt: Number(native.registered_at),
    totalMwhIssued: Number(native.total_mwh_issued),
    totalMwhRetired: Number(native.total_mwh_retired),
  };
}

// ─── Helper: Energy Source to ScVal ──────────────────────────────────────────

function energySourceToScVal(source: RECEnergySource) {
  return xdr.ScVal.scvVec([
    xdr.ScVal.scvSymbol(source),
  ]);
}

// ─── Helper: Parse RECToken from ScVal ───────────────────────────────────────

export function parseRECToken(scVal: xdr.ScVal): RECToken {
  const native = scValToNative(scVal) as Record<string, unknown>;
  return {
    id: Number(native.id),
    issuer: native.issuer as string,
    owner: native.owner as string,
    energySource: (native.energy_source as Record<string, unknown>
      ? Object.keys(native.energy_source as object)[0]
      : 'Solar') as RECEnergySource,
    mwhAmount: Number(native.mwh_amount),
    location: native.location as string,
    certificationBody: native.certification_body as string,
    vintageYear: Number(native.vintage_year),
    metadataUri: native.metadata_uri as string,
    status: (native.status as Record<string, unknown>
      ? Object.keys(native.status as object)[0]
      : 'Pending') as RECToken['status'],
    issuedAt: Number(native.issued_at),
    updatedAt: Number(native.updated_at),
    price: native.price ? BigInt(native.price as string) : null,
    retiredAt: native.retired_at ? Number(native.retired_at) : null,
    retireBeneficiary: native.retire_beneficiary as string | null,
  };
}

// ─── Build & Submit Transaction ───────────────────────────────────────────────

export async function buildAndPrepareTransaction(
  operation: xdr.Operation,
  sourceAddress: string
): Promise<string> {
  const account = await server.getAccount(sourceAddress);
  const transaction = new TransactionBuilder(account, {
    fee: APP_BASE_FEE.toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();

  const preparedTx = await server.prepareTransaction(transaction);
  return preparedTx.toXDR();
}

export async function submitTransaction(signedXDR: string): Promise<string> {
  const transaction = TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);
  const response = await server.sendTransaction(transaction);
  
  if (response.status !== 'PENDING') {
    throw new Error(`Transaction submission failed: ${response.status}`);
  }

  const hash = response.hash;
  // Wait for confirmation
  let result;
  let attempts = 0;
  do {
    await new Promise(r => setTimeout(r, 3000));
    result = await server.getTransaction(hash);
    attempts++;
  } while (result.status === 'NOT_FOUND' && attempts < 20);

  if (result.status === 'SUCCESS') {
    return hash;
  }
  throw new Error(`Transaction failed: ${result.status}`);
}

// ─── Marketplace Contract Calls ───────────────────────────────────────────────

export const marketplaceContract = {
  async getListings(): Promise<number[]> {
    try {
      const contract = new Contract(MARKETPLACE_CONTRACT_ID);
      const operation = contract.call('get_listings');
      const result = await server.simulateTransaction(
        new TransactionBuilder(
          await server.getAccount(MARKETPLACE_CONTRACT_ID),
          { fee: '100', networkPassphrase: NETWORK_PASSPHRASE }
        )
          .addOperation(operation)
          .setTimeout(30)
          .build()
      );
      if (rpc.Api.isSimulationSuccess(result) && result.result) {
        const native = scValToNative(result.result.retval) as bigint[];
        return native.map(Number);
      }
      return [];
    } catch {
      console.error('Error fetching listings');
      return [];
    }
  },

  async getREC(recId: number): Promise<RECToken | null> {
    try {
      const contract = new Contract(MARKETPLACE_CONTRACT_ID);
      const operation = contract.call(
        'get_rec',
        nativeToScVal(BigInt(recId), { type: 'u64' })
      );
      const account = await server.getAccount(MARKETPLACE_CONTRACT_ID);
      const result = await server.simulateTransaction(
        new TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(operation)
          .setTimeout(30)
          .build()
      );

      if (rpc.Api.isSimulationSuccess(result) && result.result) {
        const native = scValToNative(result.result.retval);
        if (!native) return null;
        return parseRECToken(result.result.retval);
      }
      return null;
    } catch {
      return null;
    }
  },

  async getTotalRECs(): Promise<number> {
    try {
      const contract = new Contract(MARKETPLACE_CONTRACT_ID);
      const operation = contract.call('get_total_recs');
      const account = await server.getAccount(MARKETPLACE_CONTRACT_ID);
      const result = await server.simulateTransaction(
        new TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(operation)
          .setTimeout(30)
          .build()
      );
      if (rpc.Api.isSimulationSuccess(result) && result.result) {
        return Number(scValToNative(result.result.retval));
      }
      return 0;
    } catch {
      return 0;
    }
  },

  async getUserRECs(userAddress: string): Promise<number[]> {
    try {
      const contract = new Contract(MARKETPLACE_CONTRACT_ID);
      const operation = contract.call(
        'get_user_recs',
        Address.fromString(userAddress).toScVal()
      );
      const account = await server.getAccount(userAddress);
      const result = await server.simulateTransaction(
        new TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(operation)
          .setTimeout(30)
          .build()
      );
      if (rpc.Api.isSimulationSuccess(result) && result.result) {
        const native = scValToNative(result.result.retval) as bigint[];
        return native.map(Number);
      }
      return [];
    } catch {
      return [];
    }
  },

  async buildIssueREC(params: {
    issuer: string;
    energySource: RECEnergySource;
    mwhAmount: number;
    location: string;
    certificationBody: string;
    vintageYear: number;
    metadataUri: string;
  }): Promise<string> {
    const contract = new Contract(MARKETPLACE_CONTRACT_ID);
    const operation = contract.call(
      'issue_rec',
      Address.fromString(params.issuer).toScVal(),
      energySourceToScVal(params.energySource),
      nativeToScVal(BigInt(params.mwhAmount), { type: 'u64' }),
      nativeToScVal(params.location, { type: 'string' }),
      nativeToScVal(params.certificationBody, { type: 'string' }),
      nativeToScVal(params.vintageYear, { type: 'u32' }),
      nativeToScVal(params.metadataUri, { type: 'string' })
    );
    return buildAndPrepareTransaction(operation, params.issuer);
  },

  async buildListForSale(params: {
    owner: string;
    recId: number;
    priceStroops: bigint;
  }): Promise<string> {
    const contract = new Contract(MARKETPLACE_CONTRACT_ID);
    const operation = contract.call(
      'list_for_sale',
      Address.fromString(params.owner).toScVal(),
      nativeToScVal(BigInt(params.recId), { type: 'u64' }),
      nativeToScVal(params.priceStroops, { type: 'i128' })
    );
    return buildAndPrepareTransaction(operation, params.owner);
  },

  async buildPurchase(params: {
    buyer: string;
    recId: number;
    paymentToken: string;
  }): Promise<string> {
    const contract = new Contract(MARKETPLACE_CONTRACT_ID);
    const operation = contract.call(
      'purchase_rec',
      Address.fromString(params.buyer).toScVal(),
      nativeToScVal(BigInt(params.recId), { type: 'u64' }),
      Address.fromString(params.paymentToken).toScVal()
    );
    return buildAndPrepareTransaction(operation, params.buyer);
  },

  async buildRetire(params: {
    owner: string;
    recId: number;
    beneficiaryName: string;
    retirementReason: string;
  }): Promise<string> {
    const contract = new Contract(MARKETPLACE_CONTRACT_ID);
    const operation = contract.call(
      'retire_rec',
      Address.fromString(params.owner).toScVal(),
      nativeToScVal(BigInt(params.recId), { type: 'u64' }),
      nativeToScVal(params.beneficiaryName, { type: 'string' }),
      nativeToScVal(params.retirementReason, { type: 'string' })
    );
    return buildAndPrepareTransaction(operation, params.owner);
  },

  async buildTransfer(params: {
    from: string;
    to: string;
    recId: number;
  }): Promise<string> {
    const contract = new Contract(MARKETPLACE_CONTRACT_ID);
    const operation = contract.call(
      'transfer_rec',
      Address.fromString(params.from).toScVal(),
      Address.fromString(params.to).toScVal(),
      nativeToScVal(BigInt(params.recId), { type: 'u64' })
    );
    return buildAndPrepareTransaction(operation, params.from);
  },
};

// ─── Registry Contract Calls ──────────────────────────────────────────────────

export const registryContract = {
  async getStats(): Promise<MarketStats | null> {
    try {
      const contract = new Contract(REGISTRY_CONTRACT_ID);
      const operation = contract.call('get_stats');
      const account = await server.getAccount(REGISTRY_CONTRACT_ID);
      const result = await server.simulateTransaction(
        new TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(operation)
          .setTimeout(30)
          .build()
      );
      if (rpc.Api.isSimulationSuccess(result) && result.result) {
        const native = scValToNative(result.result.retval) as Record<string, unknown>;
        return {
          totalProducers: Number(native.total_producers),
          totalMwhIssued: Number(native.total_mwh_issued),
          totalMwhRetired: Number(native.total_mwh_retired),
          totalTransactions: Number(native.total_transactions),
          totalVolumeStroops: BigInt(native.total_volume_stroops as string),
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  async buildRegisterProducer(params: {
    address: string;
    name: string;
    location: string;
    energyTypes: string[];
    capacityKw: number;
    certificationId: string;
  }): Promise<string> {
    const contract = new Contract(REGISTRY_CONTRACT_ID);
    const operation = contract.call(
      'register_producer',
      Address.fromString(params.address).toScVal(),
      nativeToScVal(params.name, { type: 'string' }),
      nativeToScVal(params.location, { type: 'string' }),
      xdr.ScVal.scvVec(
        params.energyTypes.map(t => nativeToScVal(t, { type: 'string' }))
      ),
      nativeToScVal(BigInt(params.capacityKw), { type: 'u64' }),
      nativeToScVal(params.certificationId, { type: 'string' })
    );
    return buildAndPrepareTransaction(operation, params.address);
  },

  async getProducer(address: string): Promise<Producer | null> {
    try {
      const contract = new Contract(REGISTRY_CONTRACT_ID);
      const operation = contract.call(
        'get_producer',
        Address.fromString(address).toScVal()
      );
      const account = await server.getAccount(REGISTRY_CONTRACT_ID);
      const result = await server.simulateTransaction(
        new TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(operation)
          .setTimeout(30)
          .build()
      );
      if (rpc.Api.isSimulationSuccess(result) && result.result) {
        return parseProducer(result.result.retval);
      }
      return null;
    } catch {
      return null;
    }
  },

  async getAllProducers(): Promise<string[]> {
    try {
      const contract = new Contract(REGISTRY_CONTRACT_ID);
      const operation = contract.call('get_all_producers');
      const account = await server.getAccount(REGISTRY_CONTRACT_ID);
      const result = await server.simulateTransaction(
        new TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(operation)
          .setTimeout(30)
          .build()
      );
      if (rpc.Api.isSimulationSuccess(result) && result.result) {
        return scValToNative(result.result.retval) as string[];
      }
      return [];
    } catch {
      return [];
    }
  },
};

// ─── Event Streaming ─────────────────────────────────────────────────────────

export async function fetchContractEvents(
  contractId: string,
  startLedger: number,
  cursor?: string
) {
  try {
    const response = await server.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [contractId],
        },
      ],
      limit: 50,
      cursor: cursor as any,
    });
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    return null;
  }
}

export async function getCurrentLedger(): Promise<number> {
  try {
    const info = await server.getLatestLedger();
    return info.sequence;
  } catch {
    return 0;
  }
}

// ─── Account Info ─────────────────────────────────────────────────────────────

export async function getAccountBalance(address: string): Promise<bigint> {
  try {
    // server.getAccount returns the Horizon account info or Soroban account info depending on RPC
    // For Soroban RPC it's usually getAccount(address) which returns { id, sequence }
    // Balances are usually fetched via Horizon
    const resp = await fetch(`${HORIZON_URL}/accounts/${address}`);
    const account = await resp.json();
    const xlmBalance = account.balances.find(
      (b: any) => b.asset_type === 'native'
    );
    if (xlmBalance) {
      return BigInt(Math.floor(parseFloat(xlmBalance.balance) * 10_000_000));
    }
    return BigInt(0);
  } catch {
    return BigInt(0);
  }
}
