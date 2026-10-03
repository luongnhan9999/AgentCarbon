import React, { useState } from 'react';
import { X, Scale, AlertTriangle, Coins } from 'lucide-react';
import { CarbonOrder } from '../types';
import { formatGen } from '../utils/formatters';

interface AppealModalProps {
  isOpen: boolean;
  order: CarbonOrder | null;
  onClose: () => void;
  onSubmitAppeal: (orderId: number, disputeReason: string, bondWei: string) => Promise<void>;
  onSubmitAdjudicateAppeal: (orderId: number, supplementalUrl: string) => Promise<void>;
  isSubmitting: boolean;
}

export const AppealModal: React.FC<AppealModalProps> = ({
  isOpen,
  order,
  onClose,
  onSubmitAppeal,
  onSubmitAdjudicateAppeal,
  isSubmitting,
}) => {
  const [disputeReason, setDisputeReason] = useState(
    'Cloud shadow distortion corrupted optical pass. Multi-spectral radar confirms canopy density intact.'
  );
  const [supplementalUrl, setSupplementalUrl] = useState(
    'https://copernicus-sentinel-radar.eu/data/sar_pass_sector_a.txt'
  );

  if (!isOpen || !order) return null;

  const escrowBig = BigInt(order.escrow_amount || '0');
  const bondBig = (escrowBig * 10n) / 100n;
  const isAlreadyDisputed = order.status === 6;

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitAppeal(order.order_id, disputeReason, bondBig.toString());
  };

  const handleAdjudicateAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitAdjudicateAppeal(order.order_id, supplementalUrl);
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
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Scale className="h-3.5 w-3.5" />
            <span>Appellate Chamber</span>
          </div>
          <h3 className="text-xl font-space font-bold text-slate-900">
            {isAlreadyDisputed
              ? `Adjudicate Appeal: Order #${order.order_id}`
              : `Dispute Cooling Window: Order #${order.order_id}`}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isAlreadyDisputed
              ? 'Supreme Space & Environmental Court will re-examine the claim with supplemental multi-spectral observation proof.'
              : 'Within the 24-block cooling-off window, either buyer or developer can appeal by staking a 10% dispute bond.'}
          </p>
        </div>

        {!isAlreadyDisputed ? (
          <form onSubmit={handleAppealSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">10% Bond Requirement:</span>
                Staking <span className="font-mono font-bold">{formatGen(bondBig.toString())}</span> is
                required. If the appellate decision upholds your dispute, your bond is refunded. If
                dismissed or degraded, the bond is forfeited.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispute Rationale (&gt;=10 characters)
              </label>
              <textarea
                required
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="State your technical justification for challenging the AI jury verdict..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Coins className="h-4 w-4" />
                <span>
                  {isSubmitting ? 'Staking Bond & Filing Dispute...' : `Stake ${formatGen(bondBig.toString())} & File Appeal`}
                </span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAdjudicateAppealSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="text-slate-500 mb-1">Current Dispute Reason:</div>
              <div className="font-mono text-slate-800">{order.reason}</div>
              <div className="mt-2 text-slate-500">
                Staked Bond: <span className="font-mono font-semibold text-amber-600">{formatGen(order.dispute_bond)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplemental Remote Sensing Feed URL
              </label>
              <input
                type="url"
                required
                value={supplementalUrl}
                onChange={(e) => setSupplementalUrl(e.target.value)}
                placeholder="https://supplemental-satellite.org/radar.txt"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                SAR radar, LiDAR canopy height, or cloud-free composite feed
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Scale className="h-4 w-4" />
                <span>{isSubmitting ? 'Court Deliberating...' : 'Convene Supreme Space Court'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
