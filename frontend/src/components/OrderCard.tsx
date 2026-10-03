import React from 'react';
import {
  Satellite,
  Gauge,
  MapPin,
  Scale,
  Sparkles,
  Link as LinkIcon,
  CheckCircle,
  Eye,
  RotateCcw,
  Activity,
  Flame,
  UserCheck,
  Shield,
  Layers
} from 'lucide-react';
import { CarbonOrder } from '../types';
import { formatAddress, formatGen, getStatusDetails } from '../utils/formatters';

interface OrderCardProps {
  order: CarbonOrder;
  currentAccount: string | null;
  onOpenSubmitFeeds: (orderId: number) => void;
  onAdjudicate: (orderId: number) => void;
  onOpenAppeal: (order: CarbonOrder) => void;
  onFinalize: (orderId: number) => void;
  onCancelOrReclaim: (orderId: number) => void;
  onInspect: (order: CarbonOrder) => void;
  isProcessing: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  currentAccount,
  onOpenSubmitFeeds,
  onAdjudicate,
  onOpenAppeal,
  onFinalize,
  onCancelOrReclaim,
  onInspect,
  isProcessing,
}) => {
  const statusInfo = getStatusDetails(order.status);
  const userAddr = currentAccount ? currentAccount.toLowerCase() : null;
  const isBuyer = userAddr !== null && order.buyer.toLowerCase() === userAddr;
  const isDeveloper = userAddr !== null && order.developer.toLowerCase() === userAddr;
  const isDisputeInitiator = userAddr !== null && order.dispute_initiator.toLowerCase() === userAddr;

  // Determine current user's role on this parcel
  let userRoleBadge = null;
  if (isBuyer) {
    userRoleBadge = (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center space-x-1">
        <UserCheck className="h-3 w-3" />
        <span>You: Order Buyer</span>
      </span>
    );
  } else if (isDeveloper) {
    userRoleBadge = (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-300 flex items-center space-x-1">
        <Shield className="h-3 w-3" />
        <span>You: Project Developer</span>
      </span>
    );
  } else if (isDisputeInitiator) {
    userRoleBadge = (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300 flex items-center space-x-1">
        <Scale className="h-3 w-3" />
        <span>You: Appellant</span>
      </span>
    );
  }

  return (
    <div className="group relative bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200/90 hover:border-emerald-500/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Decorative orbital radar ring watermark */}
      <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-gradient-to-br from-emerald-500/5 to-teal-500/10 pointer-events-none group-hover:scale-125 transition-transform duration-500" />

      <div>
        {/* Top bar: ID, Status, Role badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-space font-bold text-lg text-slate-900">
                Parcel #{order.order_id}
              </span>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-semibold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="mt-1 flex items-center space-x-2">
              {userRoleBadge}
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono font-bold text-lg text-slate-900 flex items-center justify-end space-x-1">
              <span>{formatGen(order.escrow_amount)}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Locked Escrow</div>
          </div>
        </div>

        {/* Geo Bounding Radar Box */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 mb-4 space-y-2.5 relative">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-medium">Coordinates:</span>
            </span>
            <span className="font-mono text-slate-800 font-medium text-[11px] truncate max-w-[190px]" title={order.target_geo_bounds}>
              {order.target_geo_bounds}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center space-x-1.5">
              <Gauge className="h-3.5 w-3.5 text-slate-400" />
              <span>Target NDVI:</span>
            </span>
            <span className="font-mono font-bold text-slate-900">
              {order.target_ndvi_threshold}%
            </span>
          </div>

          {/* Measured Telemetry metrics if available */}
          {order.measured_ndvi > 0 && (
            <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <Satellite className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Measured NDVI:</span>
                </span>
                <span className={`font-mono font-bold ${
                  order.measured_ndvi >= order.target_ndvi_threshold ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {order.measured_ndvi}% (Conf: {order.confidence}%)
                </span>
              </div>

              {order.biomass_flux_co2 && order.biomass_flux_co2 !== 'N/A' && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center space-x-1.5">
                    <Activity className="h-3 w-3 text-sky-600" />
                    <span>CO2 Flux Rate:</span>
                  </span>
                  <span className="font-mono font-semibold text-sky-700">
                    {order.biomass_flux_co2}
                  </span>
                </div>
              )}

              {order.canopy_loss_pct > 0 && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center space-x-1.5">
                    <Flame className="h-3 w-3 text-rose-500" />
                    <span>Canopy Scar/Loss:</span>
                  </span>
                  <span className="font-mono font-semibold text-rose-600">
                    {order.canopy_loss_pct}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stakeholder Addresses & Evidence Digest */}
        <div className="text-xs space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Buyer:</span>
            <span className="font-mono text-slate-800 font-medium">
              {formatAddress(order.buyer)} {isBuyer && <span className="text-emerald-600">(You)</span>}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Developer:</span>
            <span className="font-mono text-slate-800 font-medium">
              {order.developer !== '0x0000000000000000000000000000000000000000'
                ? formatAddress(order.developer)
                : 'Awaiting Claim'}
              {isDeveloper && <span className="text-sky-600 ml-1">(You)</span>}
            </span>
          </div>

          {order.dispute_initiator !== '0x0000000000000000000000000000000000000000' && (
            <div className="flex items-center justify-between text-amber-700 bg-amber-50/70 px-2 py-1 rounded-lg">
              <span>Appellant:</span>
              <span className="font-mono font-bold">
                {formatAddress(order.dispute_initiator)} ({formatGen(order.dispute_bond)} Bond)
              </span>
            </div>
          )}

          {order.evidence_hash && (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400">Digest SHA-256:</span>
              <span className="font-mono text-emerald-700 truncate max-w-[140px]" title={order.evidence_hash}>
                {order.evidence_hash.slice(0, 14)}...
              </span>
            </div>
          )}
        </div>

        {/* AI Verdict / Reason Quote */}
        {order.reason && (
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs text-slate-600 font-mono mb-4 line-clamp-2">
            "{order.reason}"
          </div>
        )}
      </div>

      {/* Role-Aware Action Buttons */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-2">
          {/* Inspection button (available to all once audited) */}
          {order.status >= 2 && (
            <button
              onClick={() => onInspect(order)}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <span>Telemetry</span>
            </button>
          )}

          {/* STATUS 0: Developer Claim (Buyer is forbidden) */}
          {order.status === 0 && (
            <button
              onClick={() => onOpenSubmitFeeds(order.order_id)}
              disabled={Boolean(isProcessing || isBuyer)}
              title={isBuyer ? "Buyer cannot claim their own order (Role Enforcement)" : "Claim this parcel as Developer"}
              className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>{isBuyer ? "Awaiting Dev Claim" : "Claim & Link Feeds"}</span>
            </button>
          )}

          {/* STATUS 1: Active Monitoring -> Convene AI Jury (Stakeholders) */}
          {order.status === 1 && (
            <button
              onClick={() => onAdjudicate(order.order_id)}
              disabled={Boolean(isProcessing || (!isBuyer && !isDeveloper && currentAccount !== null))}
              title="Stakeholders convene GenLayer AI Satellite Jury"
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Convene AI Satellite Jury</span>
            </button>
          )}

          {/* STATUS 2: Cooling-off Window -> Appeal or Finalize */}
          {order.status === 2 && (
            <>
              {(isBuyer || isDeveloper) && (
                <button
                  onClick={() => onOpenAppeal(order)}
                  disabled={isProcessing}
                  title="Challenge verdict with 10% dispute bond"
                  className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium flex items-center justify-center space-x-1 transition-colors disabled:opacity-50"
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>Appeal (10% Bond)</span>
                </button>
              )}

              <button
                onClick={() => onFinalize(order.order_id)}
                disabled={Boolean(isProcessing || (!isBuyer && !isDeveloper && currentAccount !== null))}
                title="Execute settlement after 24-block cooling window"
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center space-x-1 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Finalize Payout</span>
              </button>
            </>
          )}

          {/* STATUS 6: In Dispute -> Supreme Space Court Review */}
          {order.status === 6 && (
            <button
              onClick={() => onOpenAppeal(order)}
              disabled={Boolean(isProcessing || (!isBuyer && !isDeveloper && currentAccount !== null))}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 shadow-md"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Supreme Court Review</span>
            </button>
          )}

          {/* Reclaim: Only Buyer if open or monitoring stalled */}
          {isBuyer && (order.status === 0 || order.status === 1) && (
            <button
              onClick={() => onCancelOrReclaim(order.order_id)}
              disabled={isProcessing}
              title="Cancel or Reclaim expired escrow (Buyer Only)"
              className="py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
