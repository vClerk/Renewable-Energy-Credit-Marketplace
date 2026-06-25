'use client';

import { useState } from 'react';
import { useIssueREC } from '@/hooks/useREC';
import { RECEnergySource } from '@/lib/types';
import { ENERGY_SOURCE_LABELS } from '@/lib/config';
import { X, Leaf, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IssueRECModalProps {
  open: boolean;
  onClose: () => void;
}

export function IssueRECModal({ open, onClose }: IssueRECModalProps) {
  const issueMutation = useIssueREC();
  const [formData, setFormData] = useState({
    energySource: 'Solar' as RECEnergySource,
    mwhAmount: 100,
    location: '',
    certificationBody: 'Green-e Energy',
    vintageYear: 2024,
    metadataUri: 'ipfs://',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await issueMutation.mutateAsync(formData);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#061018] border border-[#10b981]/20 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#10b981]/10 bg-[#10b981]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Leaf size={20} color="white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#e2f4ee]">Issue New REC</h2>
              <p className="text-xs text-[#7fb3a0]">Tokenize renewable energy generation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#4a7a66] hover:text-[#f87171] transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Energy Source */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1">Energy Source</label>
              <select 
                className="input-field"
                value={formData.energySource}
                onChange={(e) => setFormData({...formData, energySource: e.target.value as RECEnergySource})}
              >
                {Object.keys(ENERGY_SOURCE_LABELS).map(key => (
                  <option key={key} value={key}>{ENERGY_SOURCE_LABELS[key]}</option>
                ))}
              </select>
            </div>

            {/* MWh Amount */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1">Generation (MWh)</label>
              <input 
                type="number" 
                required
                className="input-field"
                placeholder="e.g. 500"
                value={formData.mwhAmount}
                onChange={(e) => setFormData({...formData, mwhAmount: parseInt(e.target.value)})}
              />
            </div>

            {/* Location */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1">Plant Location</label>
              <input 
                type="text" 
                required
                className="input-field"
                placeholder="City, Region, Country"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            {/* Certification Body */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1">Certification Body</label>
              <input 
                type="text" 
                required
                className="input-field"
                placeholder="e.g. Green-e, I-REC"
                value={formData.certificationBody}
                onChange={(e) => setFormData({...formData, certificationBody: e.target.value})}
              />
            </div>

            {/* Vintage Year */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1">Vintage Year</label>
              <input 
                type="number" 
                min="2020"
                max="2030"
                required
                className="input-field"
                value={formData.vintageYear}
                onChange={(e) => setFormData({...formData, vintageYear: parseInt(e.target.value)})}
              />
            </div>

            {/* Metadata URI */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1 flex items-center justify-between">
                Audit/Metadata Link
                <Info size={12} className="text-[#4a7a66]" />
              </label>
              <input 
                type="text" 
                className="input-field font-mono text-xs"
                placeholder="ipfs://..."
                value={formData.metadataUri}
                onChange={(e) => setFormData({...formData, metadataUri: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary flex-1 py-4"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={issueMutation.isPending}
              className="btn-primary flex-1 py-4 flex items-center justify-center gap-2"
            >
              {issueMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Confirm Issuance
                </>
              )}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <Info size={16} className="text-blue-400 flex-shrink-0" />
            <p className="text-[10px] text-blue-400/80 leading-relaxed">
              Issuing a REC creates a new asset on Stellar. You must be a registered Producer to call this function. Verified Validators will review pending RECs before they become active.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
