'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtext: string;
  isString?: boolean;
}

export function StatsCard({ label, value, icon: Icon, color, subtext, isString }: StatsCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card stat-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center opacity-80"
          style={{ background: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div className="text-[10px] font-bold text-[#4a7a66] uppercase tracking-[0.2em]">
          Live Metric
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-2xl font-black text-[#e2f4ee] tracking-tight">
          {typeof value === 'number' && !isString ? value.toLocaleString() : value}
        </span>
        <span className="text-xs font-bold text-[#10b981] mt-1 uppercase tracking-widest">
          {label}
        </span>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#10b981]/5">
        <span className="text-[10px] text-[#4a7a66] font-medium uppercase tracking-widest italic">
          {subtext}
        </span>
      </div>
    </motion.div>
  );
}
