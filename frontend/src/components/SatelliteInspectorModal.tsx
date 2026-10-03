import React from 'react';
import { X, Satellite, Cpu, Hash, CheckCircle2, ShieldAlert, FileText, Activity } from 'lucide-react';
import { CarbonOrder } from '../types';

interface SatelliteInspectorModalProps {
  isOpen: boolean;
  order: CarbonOrder | null;
  onClose: () => void;
}

export const SatelliteInspectorModal: React.FC<SatelliteInspectorModalProps> = ({
  isOpen,
  order,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const isVerified = order.verdict === 'OFFSET_VERIFIED';
  const isDeficit = order.verdict === 'OFFSET_DEFICIT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Satellite className="h-3.5 w-3.5" />
            <span>AI Remote Sensing Diagnostic</span>
          </div>
          <h3 className="text-xl font-space font-bold text-slate-900">
            Satellite Inspection Telemetry: Order #{order.order_id}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Cryptographic audit of GenLayer AI Environmental Jury verdict, multi-spectral band indices, and tamper-evident SHA-256 telemetry evidence.
          </p>
        </div>

        {/* Verdict Banner */}
        <div className={`p-4 rounded-2xl mb-6 border ${
          isVerified
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : isDeficit
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-purple-50 border-purple-200 text-purple-900'
        }`}>
          <div className="flex items-center space-x-3 mb-2">
            {isVerified ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-rose-600" />
            )}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                Consensus Verdict:
              </span>
              <div className="text-lg font-space font-bold">
                {order.verdict}
              </div>
            </div>
          </div>
          <p className="text-xs font-mono leading-relaxed bg-white/70 p-3 rounded-xl border border-black/5">
            "{order.reason}"
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Target NDVI
            </div>
            <div className="text-xl font-mono font-bold text-slate-900">
              {order.target_ndvi_threshold}%
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Measured NDVI
            </div>
            <div className={`text-xl font-mono font-bold ${
              order.measured_ndvi >= order.target_ndvi_threshold
                ? 'text-emerald-600'
                : 'text-rose-600'
            }`}>
              {order.measured_ndvi}%
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
              AI Confidence
            </div>
            <div className="text-xl font-mono font-bold text-sky-600">
              {order.confidence}%
            </div>
          </div>
        </div>

        {/* Technical Audit Feeds */}
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <Hash className="h-4 w-4 text-slate-400" />
              <span>Immutable Evidence Hash (SHA-256)</span>
            </div>
            <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl break-all">
              {order.evidence_hash || 'Pending adjudication execution'}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <Satellite className="h-4 w-4 text-slate-400" />
              <span>Connected Satellite Endpoint</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 rounded-xl truncate">
              {order.satellite_feed_url || 'None linked yet'}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <Activity className="h-4 w-4 text-slate-400" />
              <span>Connected IoT Flux Tower Endpoint</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 rounded-xl truncate">
              {order.iot_sensor_url || 'None linked yet'}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 mb-1.5">
              <Cpu className="h-4 w-4 text-slate-400" />
              <span>Consensus Architecture</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
              Executed via <code className="text-emerald-700 font-mono font-semibold">gl.vm.run_nondet(leader_fn, validator_fn)</code> on GenLayer StudioNet. Multiple independent validators re-rendered the remote sensor payloads, confirmed the security canary token, and independently cross-checked measured canopy density within acceptable tolerances.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
