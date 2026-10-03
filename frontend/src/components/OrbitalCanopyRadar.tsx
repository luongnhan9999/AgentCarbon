import React, { useState } from 'react';
import {
  Satellite,
  Globe2,
  Activity,
  Layers,
  Sparkles,
  Zap,
  MapPin,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { CarbonOrder } from '../types';

interface OrbitalCanopyRadarProps {
  orders: CarbonOrder[];
  selectedOrderId: number | null;
  onSelectOrder: (orderId: number) => void;
}

export const OrbitalCanopyRadar: React.FC<OrbitalCanopyRadarProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
}) => {
  const [activeLayer, setActiveLayer] = useState<'ndvi' | 'biomass' | 'infrared'>('ndvi');

  const selectedOrder = orders.find((o) => o.order_id === selectedOrderId) || orders[0] || null;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl border border-emerald-500/30 relative overflow-hidden">
      {/* Background Orbital Grid FX */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE SENTINEL-2 ORBITAL CONSOLE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-space font-bold tracking-tight">
              Satellite Earth Observation Radar
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Multi-spectral synthetic aperture radar (SAR) & optical NDVI cross-referenced on GenLayer StudioNet.
            </p>
          </div>

          {/* Layer switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl self-start sm:self-auto text-xs font-mono">
            <button
              onClick={() => setActiveLayer('ndvi')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayer === 'ndvi'
                  ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              NDVI Canopy
            </button>
            <button
              onClick={() => setActiveLayer('biomass')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayer === 'biomass'
                  ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Carbon Flux
            </button>
            <button
              onClick={() => setActiveLayer('infrared')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayer === 'infrared'
                  ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              NIR Multi-Spectral
            </button>
          </div>
        </div>

        {/* Console Interactive Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          {/* Visual Radar Simulation Canvas */}
          <div className="lg:col-span-2 relative aspect-video sm:aspect-[21/9] rounded-2xl bg-slate-950/80 border border-white/10 overflow-hidden flex items-center justify-center p-6">
            {/* Animated Radar Sweep */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[120%] h-[120%] rounded-full border border-emerald-500/10 animate-pulse" />
              <div className="w-[80%] h-[80%] rounded-full border border-emerald-500/20" />
              <div className="w-[50%] h-[50%] rounded-full border border-emerald-500/30" />
              <div className="w-[20%] h-[20%] rounded-full border border-emerald-500/40" />

              {/* Rotating Sweep Line */}
              <div className="absolute inset-0 origin-center animate-[spin_8s_linear_infinite] bg-gradient-to-tr from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Simulated Satellite Heatmap Tiles */}
            <div className="absolute inset-4 grid grid-cols-8 grid-rows-4 gap-1 opacity-60">
              {Array.from({ length: 32 }).map((_, i) => {
                const isDense = (i * 7) % 5 === 0 || (i * 3) % 4 === 0;
                const isLoss = i === 18 || i === 22;
                let bgTile = 'bg-emerald-950/40 border border-emerald-500/20';
                if (activeLayer === 'ndvi') {
                  bgTile = isLoss
                    ? 'bg-rose-950/60 border border-rose-500/40 animate-pulse'
                    : isDense
                    ? 'bg-emerald-600/40 border border-emerald-400/50'
                    : 'bg-emerald-900/30 border border-emerald-500/20';
                } else if (activeLayer === 'biomass') {
                  bgTile = isDense
                    ? 'bg-sky-600/40 border border-sky-400/50'
                    : 'bg-sky-950/30 border border-sky-500/20';
                } else {
                  bgTile = isDense
                    ? 'bg-purple-600/40 border border-purple-400/50'
                    : 'bg-purple-950/30 border border-purple-500/20';
                }
                return (
                  <div
                    key={i}
                    className={`rounded-md transition-colors duration-700 flex items-center justify-center text-[8px] font-mono text-white/40 ${bgTile}`}
                  >
                    B{i + 1}
                  </div>
                );
              })}
            </div>

            {/* Target Crosshair & Geo Overlay */}
            <div className="relative z-10 text-center bg-black/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-emerald-500/40 max-w-md">
              <div className="flex items-center justify-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {selectedOrder ? selectedOrder.target_geo_bounds : 'Awaiting Parcel Selection'}
                </span>
              </div>
              <div className="text-xl font-space font-bold text-white">
                {selectedOrder
                  ? `Parcel #${selectedOrder.order_id}: ${selectedOrder.verdict}`
                  : 'No Active Parcel Selected'}
              </div>
              <div className="text-xs text-slate-300 font-mono mt-1">
                {selectedOrder && selectedOrder.measured_ndvi > 0 ? (
                  <span>
                    Measured NDVI: <b className="text-emerald-400">{selectedOrder.measured_ndvi}%</b> (Target: {selectedOrder.target_ndvi_threshold}%) &middot; Conf: {selectedOrder.confidence}%
                  </span>
                ) : (
                  <span>Ready for multi-spectral observation telemetry ingestion</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Metrics Panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>Orbital Telemetry Feed</span>
              </div>

              {selectedOrder ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="text-white font-bold">#{selectedOrder.order_id}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-400">Consensus Verdict:</span>
                    <span className={`font-bold ${
                      selectedOrder.verdict === 'OFFSET_VERIFIED'
                        ? 'text-emerald-400'
                        : selectedOrder.verdict === 'OFFSET_DEFICIT'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}>
                      {selectedOrder.verdict}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-400">Carbon Flux Rate:</span>
                    <span className="text-sky-300 font-bold">
                      {selectedOrder.biomass_flux_co2 || '-14.2 gC/m2/d'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-400">Canopy Loss Scar:</span>
                    <span className="text-rose-400 font-bold">
                      {selectedOrder.canopy_loss_pct || 0}%
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-400">Cryptographic Digest:</span>
                    <span className="text-emerald-400 text-[10px] truncate max-w-[120px]">
                      {selectedOrder.evidence_hash ? selectedOrder.evidence_hash.slice(0, 16) + '...' : 'Pending'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 text-center py-6">
                  Select a parcel below to view telemetry diagnosis
                </div>
              )}
            </div>

            {/* Quick Parcel Select Pills */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Active Parcels on StudioNet:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {orders.map((o) => (
                  <button
                    key={o.order_id}
                    onClick={() => onSelectOrder(o.order_id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                      selectedOrderId === o.order_id
                        ? 'bg-emerald-500 text-white font-bold'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    #{o.order_id} ({o.target_ndvi_threshold}%)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
