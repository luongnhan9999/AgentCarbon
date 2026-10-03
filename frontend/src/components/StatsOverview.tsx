import React from 'react';
import { ShieldCheck, Trees, Scale, Layers } from 'lucide-react';
import { StatsData } from '../types';
import { formatGen } from '../utils/formatters';

interface StatsOverviewProps {
  stats: StatsData | null;
  totalOrders: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, totalOrders }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Locked */}
      <div className="bg-white p-5 rounded-2xl border border-climate-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Escrow Locked
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Trees className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-space font-bold text-slate-900">
          {stats ? formatGen(stats.total_carbon_locked) : '0.0000 GEN'}
        </div>
        <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
          <span className="text-emerald-600 font-medium font-mono">100% On-Chain</span>
          <span>collateralized</span>
        </div>
      </div>

      {/* Offsets Settled */}
      <div className="bg-white p-5 rounded-2xl border border-climate-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Offsets Settled
          </span>
          <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-space font-bold text-slate-900">
          {stats ? stats.total_offsets_settled : 0}
        </div>
        <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
          <span className="text-sky-600 font-medium font-mono">Multi-spectral</span>
          <span>satellite verified</span>
        </div>
      </div>

      {/* Total Orders */}
      <div className="bg-white p-5 rounded-2xl border border-climate-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Monitored Parcels
          </span>
          <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-space font-bold text-slate-900">
          {totalOrders}
        </div>
        <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
          <span className="text-purple-600 font-medium font-mono">Geo-bounded</span>
          <span>Sentinel & IoT telemetry</span>
        </div>
      </div>

      {/* Consensus Integrity */}
      <div className="bg-white p-5 rounded-2xl border border-climate-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Cooling Window
          </span>
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Scale className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-space font-bold text-slate-900">
          24 Blocks
        </div>
        <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
          <span className="text-amber-600 font-medium font-mono">Appellate Court</span>
          <span>10% staked dispute bond</span>
        </div>
      </div>
    </div>
  );
};
