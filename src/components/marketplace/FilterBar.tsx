'use client';

import { FilterParams, RECEnergySource } from '@/lib/types';
import { Search, ChevronDown, Filter, SlidersHorizontal } from 'lucide-react';
import { ENERGY_SOURCE_LABELS } from '@/lib/config';

interface FilterBarProps {
  filters: FilterParams;
  onChange: (filters: FilterParams) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a7a66]" size={18} />
          <input 
            type="text" 
            placeholder="Search by location, certification or ID..."
            className="input-field pl-12 h-12"
            value={filters.location || ''}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
          />
        </div>

        {/* Energy Source Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['all', 'Solar', 'Wind', 'Hydro', 'Biomass', 'Geothermal'].map((src) => (
            <button
              key={src}
              onClick={() => onChange({ ...filters, energySource: src as any })}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                (filters.energySource || 'all') === src
                  ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]'
                  : 'bg-[#081420] border-[#10b981]/10 text-[#7fb3a0] hover:border-[#10b981]/30'
              }`}
            >
              {src === 'all' ? 'All Sources' : ENERGY_SOURCE_LABELS[src]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-t border-[#10b981]/5">
        <div className="flex items-center gap-6">
          {/* Price Range (Simplified) */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest">Price Limit</span>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Max XLM"
                className="input-field w-24 h-9 py-0 text-xs"
                value={filters.maxPrice || ''}
                onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest">Sort By</span>
            <select 
              className="bg-[#081420] border border-[#10b981]/10 rounded-lg text-xs text-[#e2f4ee] px-2 py-1.5 outline-none focus:border-[#10b981]"
              value={filters.sortBy || 'newest'}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="mwh-desc">Volume: High to Low</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#4a7a66]">
          Showing <span className="text-[#10b981] font-bold">Verified</span> testnet listings only
        </div>
      </div>
    </div>
  );
}
