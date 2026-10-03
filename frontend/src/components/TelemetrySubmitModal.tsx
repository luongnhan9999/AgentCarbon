import React, { useState } from 'react';
import { X, Satellite, Radio, CheckCircle2 } from 'lucide-react';

interface TelemetrySubmitModalProps {
  isOpen: boolean;
  orderId: number | null;
  onClose: () => void;
  onSubmit: (orderId: number, satUrl: string, iotUrl: string) => Promise<void>;
  isSubmitting: boolean;
}

export const TelemetrySubmitModal: React.FC<TelemetrySubmitModalProps> = ({
  isOpen,
  orderId,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [satUrl, setSatUrl] = useState('https://sentinel-hub.org/data/amazon_sector_a.txt');
  const [iotUrl, setIotUrl] = useState('https://fluxnet.org/telemetry/tower_42.json');

  if (!isOpen || orderId === null) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(orderId, satUrl, iotUrl);
  };

  const handleFillMockFeeds = () => {
    setSatUrl('https://sentinel-hub.org/data/amazon_sector_a.txt');
    setIotUrl('https://fluxnet.org/telemetry/tower_42.json');
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
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Radio className="h-3.5 w-3.5" />
            <span>Developer Telemetry Link</span>
          </div>
          <h3 className="text-xl font-space font-bold text-slate-900">
            Submit Feeds for Order #{orderId}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Claim this carbon order as Project Developer by providing verifiable public satellite and ground flux sensor data endpoints.
          </p>
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={handleFillMockFeeds}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium underline"
          >
            Use Sample Copernicus/Sentinel & FLUXNET Endpoints
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Satellite className="h-3.5 w-3.5 text-slate-400" />
              <span>Sentinel / NASA Earth Observation URL</span>
            </label>
            <input
              type="url"
              required
              value={satUrl}
              onChange={(e) => setSatUrl(e.target.value)}
              placeholder="https://sentinel-hub.org/data/sector.txt"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Fetched on-chain via gl.nondet.web.render
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Radio className="h-3.5 w-3.5 text-slate-400" />
              <span>Ground Flux Tower / IoT Telemetry URL</span>
            </label>
            <input
              type="url"
              required
              value={iotUrl}
              onChange={(e) => setIotUrl(e.target.value)}
              placeholder="https://fluxnet.org/telemetry/tower.json"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Provides ground-truth sap flow, CO2 flux, and soil moisture
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Linking Feeds On-Chain...' : 'Claim & Link Telemetry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
