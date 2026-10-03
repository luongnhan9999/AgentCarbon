import React from 'react';
import {
  Satellite,
  Gauge,
  MapPin,
  Clock,
  ShieldCheck,
  Scale,
  Sparkles,
  Link as LinkIcon,
  CheckCircle,
  Eye,
  RotateCcw
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
  const isBuyer = currentAccount && order.buyer.toLowerCase() === currentAccount.toLowerCase();
  const isDeveloper = currentAccount && order.developer.toLowerCase() === currentAccount.toLowerCase();

  return (
    <div className="bg-white rounded-2xl border border-climate-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Header: ID, Escrow & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-space font-bold text-lg text-slate-900">
                Order #{order.order_id}
              </span>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-semibold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center space-x-1">
              <span>Buyer:</span>
              <span className="text-slate-700">{formatAddress(order.buyer)}</span>
              {isBuyer && <span className="text-emerald-600 font-bold">(You)</span>}
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono font-bold text-lg text-slate-900">
              {formatGen(order.escrow_amount)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Locked Escrow</div>
          </div>
        </div>

        {/* Geo Bounds & NDVI Metrics */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>Target Bounds:</span>
            </span>
            <span className="font-mono text-slate-800 font-medium text-[11px] truncate max-w-[200px]" title={order.target_geo_bounds}>
              {order.target_geo_bounds}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center space-x-1">
              <Gauge className="h-3.5 w-3.5 text-slate-400" />
              <span>Target NDVI:</span>
            </span>
            <span className="font-mono font-semibold text-slate-800">
              {order.target_ndvi_threshold}%
            </span>
          </div>

          {order.measured_ndvi > 0 && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 flex items-center space-x-1">
                <Satellite className="h-3.5 w-3.5 text-emerald-600" />
                <span>Measured NDVI:</span>
              </span>
              <span className={`font-mono font-bold ${
                order.measured_ndvi >= order.target_ndvi_threshold ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {order.measured_ndvi}% (Conf: {order.confidence}%)
              </span>
            </div>
          )}
        </div>

        {/* Developer & Feeds Info */}
        <div className="text-xs space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Developer:</span>
            <span className="font-mono text-slate-700">
              {order.developer !== '0x0000000000000000000000000000000000000000'
                ? formatAddress(order.developer)
                : 'Awaiting Claim'}
              {isDeveloper && <span className="text-emerald-600 font-bold ml-1">(You)</span>}
            </span>
          </div>

          {order.evidence_hash && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Evidence SHA:</span>
              <span className="font-mono text-emerald-700 truncate max-w-[150px]" title={order.evidence_hash}>
                {order.evidence_hash.slice(0, 12)}...
              </span>
            </div>
          )}
        </div>

        {/* AI Verdict / Reason snippet */}
        {order.reason && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 font-mono mb-4 line-clamp-2">
            "{order.reason}"
          </div>
        )}
      </div>

      {/* Action Buttons based on status */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-2">
          {/* Deep inspection button if audit executed */}
          {order.status >= 2 && (
            <button
              onClick={() => onInspect(order)}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <span>Inspect Telemetry</span>
            </button>
          )}

          {/* Status 0: Open -> Developer can Claim */}
          {order.status === 0 && (
            <button
              onClick={() => onOpenSubmitFeeds(order.order_id)}
              disabled={Boolean(isProcessing || isBuyer)}
              title={isBuyer ? "Buyer cannot claim their own order" : ""}
              className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Claim & Link Feeds</span>
            </button>
          )}

          {/* Status 1: Monitoring -> AI Adjudication */}
          {order.status === 1 && (
            <button
              onClick={() => onAdjudicate(order.order_id)}
              disabled={isProcessing}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Convene AI Satellite Jury</span>
            </button>
          )}

          {/* Status 2: Awaiting Payout (Cooling window) -> Appeal or Finalize */}
          {order.status === 2 && (
            <>
              <button
                onClick={() => onOpenAppeal(order)}
                disabled={isProcessing}
                className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium flex items-center justify-center space-x-1 transition-colors disabled:opacity-50"
              >
                <Scale className="h-3.5 w-3.5" />
                <span>Appeal (10% Bond)</span>
              </button>

              <button
                onClick={() => onFinalize(order.order_id)}
                disabled={isProcessing}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center space-x-1 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Finalize Payout</span>
              </button>
            </>
          )}

          {/* Status 6: Disputed -> Supreme Space Court Adjudicate */}
          {order.status === 6 && (
            <button
              onClick={() => onOpenAppeal(order)}
              disabled={isProcessing}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Adjudicate Appeal Feed</span>
            </button>
          )}

          {/* Buyer can cancel/reclaim if open/expired */}
          {isBuyer && (order.status === 0 || order.status === 1) && (
            <button
              onClick={() => onCancelOrReclaim(order.order_id)}
              disabled={isProcessing}
              title="Cancel or Reclaim expired escrow"
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
