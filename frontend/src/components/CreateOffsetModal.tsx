import React, { useState } from 'react';
import { X, Sparkles, MapPin, Gauge, Lock } from 'lucide-react';

interface CreateOffsetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (geoBounds: string, targetNdvi: number, durationBlocks: number, amountGen: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateOffsetModal: React.FC<CreateOffsetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [geoBounds, setGeoBounds] = useState('[-3.4653, -62.2159, -3.1234, -62.0012]');
  const [targetNdvi, setTargetNdvi] = useState(70);
  const [durationBlocks, setDurationBlocks] = useState(5000);
  const [amountGen, setAmountGen] = useState('1.0');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(geoBounds, targetNdvi, durationBlocks, amountGen);
  };

  const handleFillPreset = (bounds: string, ndvi: number) => {
    setGeoBounds(bounds);
    setTargetNdvi(ndvi);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Lock className="h-3.5 w-3.5" />
            <span>Escrow Guarantee</span>
          </div>
          <h3 className="text-xl font-space font-bold text-slate-900">
            Create Carbon Offset Order
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Lock native GEN collateral. Payment is released exclusively when AI validators verify multi-spectral satellite canopy density meets your target.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Region Presets:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFillPreset('[-3.4653, -62.2159, -3.1234, -62.0012]', 75)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors font-mono"
            >
              Amazon Basin Sector A
            </button>
            <button
              type="button"
              onClick={() => handleFillPreset('[0.3476, 18.5521, 0.7812, 18.9914]', 70)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors font-mono"
            >
              Congo Peatlands Reserve
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>Target Geo-Coordinates / Bounding Box</span>
              </span>
              <span className="text-[10px] text-slate-400">[minLat, minLon, maxLat, maxLon]</span>
            </label>
            <input
              type="text"
              required
              value={geoBounds}
              onChange={(e) => setGeoBounds(e.target.value)}
              placeholder="e.g. [-3.4653, -62.2159, -3.1234, -62.0012]"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                <span>Target NDVI (0-100)</span>
              </label>
              <input
                type="number"
                min="10"
                max="95"
                required
                value={targetNdvi}
                onChange={(e) => setTargetNdvi(parseInt(e.target.value) || 70)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">e.g. 70 = 0.70 NDVI density</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Blocks)
              </label>
              <input
                type="number"
                min="100"
                required
                value={durationBlocks}
                onChange={(e) => setDurationBlocks(parseInt(e.target.value) || 5000)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Expiry duration</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Escrow Deposit Amount (GEN)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={amountGen}
                onChange={(e) => setAmountGen(e.target.value)}
                placeholder="1.0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold font-mono text-slate-400">
                GEN
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              100% held securely in GenVM smart contract until verification
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isSubmitting ? 'Locking Escrow on GenLayer...' : 'Deposit Escrow & Create Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
