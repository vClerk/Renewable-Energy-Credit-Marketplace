'use client';

import { RECToken } from '@/lib/types';
import { 
  Leaf, MapPin, Calendar, Verified, 
  ArrowRight, Tag, Shield, ShoppingCart 
} from 'lucide-react';
import { formatXLM, formatMWh, truncateAddress } from '@/lib/utils';
import { ENERGY_SOURCE_LABELS, ENERGY_SOURCE_COLORS, ENERGY_SOURCE_ICONS } from '@/lib/config';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/store';
import { useListForSale, usePurchaseREC, useRetireREC } from '@/hooks/useREC';
import { useState } from 'react';
import { xlmToStroops } from '@/lib/utils';

interface RECCardProps {
  rec: RECToken;
  showOwnerActions?: boolean;
}

export function RECCard({ rec, showOwnerActions }: RECCardProps) {
  const { address } = useWalletStore();
  const [isListing, setIsListing] = useState(false);
  const [priceInput, setPriceInput] = useState('5.0');
  
  const listMutation = useListForSale();
  const purchaseMutation = usePurchaseREC();
  const retireMutation = useRetireREC();

  const isOwner = address === rec.owner;
  const isPending = rec.status === 'Pending';
  const isActive = rec.status === 'Active';
  const isListed = rec.status === 'Listed';
  const isRetired = rec.status === 'Retired';

  const icon = ENERGY_SOURCE_ICONS[rec.energySource] || '⚡';
  const color = ENERGY_SOURCE_COLORS[rec.energySource] || '#10b981';

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card flex flex-col group overflow-hidden"
    >
      {/* Card Header */}
      <div className="relative p-5 pb-0">
        <div className="flex justify-between items-start mb-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ring-1 ring-white/10"
            style={{ background: `${color}20` }}
          >
            {icon}
          </div>
          <div className="flex flex-col items-end">
            <span className={`badge badge-${rec.status.toLowerCase()}`}>
              {rec.status}
            </span>
            <span className="text-[10px] text-[#4a7a66] mt-1 font-bold tracking-widest uppercase">
              REC #{rec.id}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-[#e2f4ee] mb-1 line-clamp-1 group-hover:text-[#10b981] transition-colors">
          {ENERGY_SOURCE_LABELS[rec.energySource]} Energy Credit
        </h3>
        <p className="text-2xl font-black text-[#10b981] mb-4">
          {formatMWh(rec.mwhAmount)}
        </p>
      </div>

      {/* Details List */}
      <div className="px-5 py-4 space-y-3 bg-[#061018]/40 border-y border-[#10b981]/5">
        <div className="flex items-center gap-2 text-sm text-[#7fb3a0]">
          <MapPin size={14} className="text-[#4a7a66]" />
          <span className="line-clamp-1">{rec.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#7fb3a0]">
          <Verified size={14} className="text-[#4a7a66]" />
          <span className="line-clamp-1">{rec.certificationBody}</span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-xs text-[#4a7a66] font-medium uppercase tracking-wider">
            <Calendar size={12} />
            Vintage {rec.vintageYear}
          </div>
          <div className="text-[10px] text-[#4a7a66] font-bold">
            OWNER: {truncateAddress(rec.owner)}
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-5 mt-auto">
        {isListed && !isOwner && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest">Market Price</span>
              <span className="text-xl font-bold text-[#e2f4ee]">{formatXLM(rec.price || BigInt(0))} XLM</span>
            </div>
            <button 
              onClick={() => {
                purchaseMutation.mutate({ recId: rec.id, paymentToken: 'native' });
              }}
              disabled={purchaseMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} />
              {purchaseMutation.isPending ? 'Processing...' : 'Purchase Now'}
            </button>
          </div>
        )}

        {showOwnerActions && isOwner && (
          <div className="flex flex-col gap-3">
            {isActive && !isListing && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsListing(true)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Tag size={16} />
                  List
                </button>
                <button 
                  onClick={() => {
                    const beneficiary = prompt("Enter beneficiary name (e.g. Acme corp):") || "Self";
                    retireMutation.mutate({ 
                      recId: rec.id, 
                      beneficiaryName: beneficiary, 
                      retirementReason: "Sustainability Goal 2024" 
                    });
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Shield size={16} />
                  Retire
                </button>
              </div>
            )}

            {isActive && isListing && (
              <div className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-[#10b981]/10">
                <label className="text-[10px] font-bold text-[#4a7a66] uppercase">Listing Price (XLM)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="input-field flex-1 text-sm py-1.5"
                  />
                  <button 
                    onClick={() => {
                      listMutation.mutate({ 
                        recId: rec.id, 
                        priceStroops: xlmToStroops(parseFloat(priceInput)) 
                      });
                      setIsListing(false);
                    }}
                    className="btn-primary"
                    style={{ padding: '4px 12px' }}
                  >
                    Set
                  </button>
                </div>
              </div>
            )}

            {isListed && (
              <button 
                className="btn-secondary w-full"
                onClick={() => {
                  // In a real app we'd call the delist mutation
                  alert("Use the delist function on-chain");
                }}
              >
                Managing Listing...
              </button>
            )}

            {isRetired && (
              <div className="flex items-center justify-center gap-2 p-3 bg-[#10b981]/5 rounded-xl border border-[#10b981]/10">
                <Shield size={16} className="text-[#10b981]" />
                <span className="text-sm font-bold text-[#10b981]">Permanently Retired</span>
              </div>
            )}
          </div>
        )}

        {!isListed && !isOwner && !isRetired && (
          <div className="flex items-center justify-center p-3 text-sm text-[#4a7a66] font-medium bg-[#020b12] rounded-xl">
             Not listed for sale
          </div>
        )}

        {isRetired && !isOwner && (
          <div className="flex items-center justify-center gap-2 p-3 text-sm text-[#4a7a66] font-medium bg-[#020b12] rounded-xl">
            <Shield size={14} /> Retired by owner
          </div>
        )}
      </div>
    </motion.div>
  );
}
