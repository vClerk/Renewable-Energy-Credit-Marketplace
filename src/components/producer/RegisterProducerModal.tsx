'use client';

import { useState } from 'react';
import { useRegisterProducer } from '@/hooks/useProducer';
import { ENERGY_SOURCE_LABELS } from '@/lib/config';
import { X, Factory, Info, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegisterProducerModalProps {
  open: boolean;
  onClose: () => void;
}

export function RegisterProducerModal({ open, onClose }: RegisterProducerModalProps) {
  const registerMutation = useRegisterProducer();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    energyTypes: ['Solar'],
    capacityKw: 1000,
    certificationId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerMutation.mutateAsync(formData);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleEnergyType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      energyTypes: prev.energyTypes.includes(type)
        ? prev.energyTypes.filter(t => t !== type)
        : [...prev.energyTypes, type]
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-[#061018] border border-[#10b981]/20 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#10b981]/10 bg-[#3B82F6]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center">
              <Factory size={20} color="white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#e2f4ee]">Producer Registration</h2>
              <p className="text-xs text-[#7fb3a0]">Register your facility on the REC network</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#4a7a66] hover:text-[#f87171]">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1">Facility Name</label>
              <input 
                type="text" 
                required
                className="input-field"
                placeholder="e.g. Sunshine Solar Farm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1">Location</label>
              <input 
                type="text" 
                required
                className="input-field"
                placeholder="City, State, Country"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1">Capacity (kW)</label>
                <input 
                  type="number" 
                  required
                  className="input-field"
                  value={formData.capacityKw}
                  onChange={(e) => setFormData({...formData, capacityKw: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1">Certification ID</label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  placeholder="ID #12345"
                  value={formData.certificationId}
                  onChange={(e) => setFormData({...formData, certificationId: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-[#4a7a66] uppercase tracking-widest px-1">Energy Generation Types</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(ENERGY_SOURCE_LABELS).map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleEnergyType(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      formData.energyTypes.includes(key)
                        ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                        : 'bg-white/5 border-white/10 text-[#7fb3a0] hover:bg-white/10'
                    }`}
                  >
                    {ENERGY_SOURCE_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Submit Application
                </>
              )}
            </button>
          </div>

          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-blue-400/80 leading-relaxed">
              Upon submission, your facility will enter a **Pending** state. A network administrator will verify your credentials and plant capacity before granting issuance rights.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
