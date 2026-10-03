import React from 'react';
import { Satellite, Globe2, Wallet, RefreshCw, ExternalLink } from 'lucide-react';
import { formatAddress, formatGen } from '../utils/formatters';
import { DEFAULT_CONTRACT_ADDRESS } from '../config/genlayer';

interface NavbarProps {
  account: string | null;
  balance: string;
  isConnecting: boolean;
  onConnect: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  account,
  balance,
  isConnecting,
  onConnect,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="border-b border-climate-border bg-white sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Satellite className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-space font-bold text-xl tracking-tight text-slate-900">
                AgentCarbon
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                StudioNet 61999
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Autonomous Satellite & Sensor Carbon Offset Escrow
            </p>
          </div>
        </div>

        {/* Center / Network & Contract details */}
        <div className="hidden md:flex items-center space-x-4 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <div className="flex items-center space-x-1.5 text-slate-600">
            <Globe2 className="h-3.5 w-3.5 text-sky-600" />
            <span>Contract:</span>
            <a
              href={`https://genlayer-explorer.vercel.app/address/${DEFAULT_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-900 hover:text-emerald-600 font-medium flex items-center space-x-0.5"
            >
              <span>{formatAddress(DEFAULT_CONTRACT_ADDRESS)}</span>
              <ExternalLink className="h-3 w-3 inline" />
            </a>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh on-chain state"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {account ? (
            <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 p-1.5 pr-3 rounded-xl">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono text-xs font-bold">
                {account.slice(2, 4).toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <div className="font-mono font-medium text-slate-900 flex items-center space-x-1">
                  <span>{formatAddress(account)}</span>
                </div>
                <div className="font-mono text-emerald-600 text-[11px] font-semibold">
                  {formatGen(balance)}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-sm hover:shadow"
            >
              <Wallet className="h-4 w-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
