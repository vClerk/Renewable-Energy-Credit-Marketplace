'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchContractEvents, getCurrentLedger } from '@/lib/contracts';
import { scValToNative } from '@stellar/stellar-sdk';
import { MARKETPLACE_CONTRACT_ID, REGISTRY_CONTRACT_ID } from '@/lib/config';
import type { ContractEvent } from '@/lib/types';
import { eventLogger } from '@/lib/logger';
import { generateId } from '@/lib/utils';

const POLL_INTERVAL_MS = 5000;
const MAX_EVENTS = 100;

export function useContractEvents() {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const lastLedgerRef = useRef<number>(0);
  const intervalRef = useRef<any>();

  const parseEvents = useCallback((rawEvents: ReturnType<typeof fetchContractEvents> extends Promise<infer T> ? T : never) => {
    if (!rawEvents || !('events' in rawEvents)) return [];
    return rawEvents.events.map((e: Record<string, unknown>) => ({
      id: generateId(),
      type: extractEventType(e),
      recId: extractRecId(e),
      timestamp: Date.now() / 1000,
      data: e,
      ledger: Number((e as Record<string, unknown>).ledger || 0),
      txHash: String((e as Record<string, unknown>).txHash || ''),
    } as ContractEvent));
  }, []);

  const poll = useCallback(async () => {
    try {
      const currentLedger = await getCurrentLedger();
      if (lastLedgerRef.current === 0) {
        lastLedgerRef.current = Math.max(currentLedger - 100, 1);
      }

      const [marketplaceEvents, registryEvents] = await Promise.all([
        fetchContractEvents(MARKETPLACE_CONTRACT_ID, lastLedgerRef.current),
        fetchContractEvents(REGISTRY_CONTRACT_ID, lastLedgerRef.current),
      ]);

      const parsed = [
        ...parseEvents(marketplaceEvents as Parameters<typeof parseEvents>[0]),
        ...parseEvents(registryEvents as Parameters<typeof parseEvents>[0]),
      ].sort((a, b) => b.ledger - a.ledger);

      if (parsed.length > 0) {
        eventLogger.debug(`Received ${parsed.length} new events`);
        setEvents((prev) =>
          [...parsed, ...prev].slice(0, MAX_EVENTS)
        );
        lastLedgerRef.current = currentLedger;
      }

      setIsConnected(true);
    } catch (err) {
      eventLogger.warn('Event polling error', err);
      setIsConnected(false);
    }
  }, [parseEvents]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, isConnected, clearEvents };
}

function extractEventType(event: Record<string, unknown>): string {
  try {
    const topics = event.topic as any[] | undefined;
    if (topics && topics.length > 0) {
      // Topics are returned as XDR strings in some environments, or ScVal objects
      const firstTopic = typeof topics[0] === 'string' 
        ? scValToNative(topics[0] as any) 
        : scValToNative(topics[0]);
      return String(firstTopic);
    }
    return 'contract_event';
  } catch (err) {
    console.error('Error extracting event type', err);
    return 'contract_event';
  }
}

function extractRecId(event: Record<string, unknown>): number | undefined {
  try {
    const topics = event.topic as any[] | undefined;
    if (topics && topics.length > 1) {
      const idVal = scValToNative(topics[1]);
      const id = typeof idVal === 'bigint' ? Number(idVal) : parseInt(String(idVal));
      return isNaN(id) ? undefined : id;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
