import React, { useState, useEffect } from 'react';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { OrderCard } from './components/OrderCard';
import { CreateOffsetModal } from './components/CreateOffsetModal';
import { TelemetrySubmitModal } from './components/TelemetrySubmitModal';
import { SatelliteInspectorModal } from './components/SatelliteInspectorModal';
import { AppealModal } from './components/AppealModal';
import { CarbonOrder, StatsData } from './types';
import { DEFAULT_CONTRACT_ADDRESS, CHAIN_ID_HEX } from './config/genlayer';
import { Plus, Satellite, RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isTxPending, setIsTxPending] = useState(false);
  const [txMessage, setTxMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Contract Data
  const [orders, setOrders] = useState<CarbonOrder[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [telemetryTargetId, setTelemetryTargetId] = useState<number | null>(null);
  const [inspectOrder, setInspectOrder] = useState<CarbonOrder | null>(null);
  const [appealOrder, setAppealOrder] = useState<CarbonOrder | null>(null);

  // Initialize and check MetaMask on load
  useEffect(() => {
    if ((window as any).ethereum) {
      (window as any).ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            fetchBalance(accounts[0]);
          }
        })
        .catch(console.error);

      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchBalance(accounts[0]);
        } else {
          setAccount(null);
          setBalance('0');
        }
      });
    }
    fetchContractState();
  }, []);

  const fetchBalance = async (addr: string) => {
    try {
      if ((window as any).ethereum) {
        const balHex = await (window as any).ethereum.request({
          method: 'eth_getBalance',
          params: [addr, 'latest'],
        });
        setBalance(BigInt(balHex).toString());
      }
    } catch (e) {
      console.warn('Failed to fetch balance:', e);
    }
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert('MetaMask or Web3 wallet not detected. Please install MetaMask.');
      return;
    }
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      // 1. Switch to GenLayer StudioNet
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CHAIN_ID_HEX }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902 || switchError.code === -32603) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: CHAIN_ID_HEX,
                chainName: 'Genlayer Studio Network',
                nativeCurrency: { name: 'GEN Token', symbol: 'GEN', decimals: 18 },
                rpcUrls: ['https://studio.genlayer.com/api'],
                blockExplorerUrls: ['https://genlayer-explorer.vercel.app'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      // 2. Request accounts
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await fetchBalance(accounts[0]);
      }
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      setErrorMsg(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const getClient = () => {
    if (!account) {
      return createClient({ chain: studionet });
    }
    return createClient({ chain: studionet, account: account as `0x${string}` });
  };

  const fetchContractState = async () => {
    setIsLoadingData(true);
    try {
      const client = getClient();

      // Read all orders
      const rawAllOrders = await (client as any).readContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'get_all_orders',
        args: [],
      });

      if (rawAllOrders) {
        const parsedOrders: CarbonOrder[] = typeof rawAllOrders === 'string' ? JSON.parse(rawAllOrders) : rawAllOrders;
        setOrders(parsedOrders.reverse()); // most recent first
      }

      // Read stats
      const rawStats = await (client as any).readContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'get_stats',
        args: [],
      });

      if (rawStats) {
        const parsedStats: StatsData = typeof rawStats === 'string' ? JSON.parse(rawStats) : rawStats;
        setStats(parsedStats);
      }
    } catch (err: any) {
      console.error('Error fetching on-chain state:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // ── Smart Contract Write Actions ──────────────────────────────────

  const handleCreateOrder = async (
    geoBounds: string,
    targetNdvi: number,
    durationBlocks: number,
    amountGen: string
  ) => {
    if (!account) {
      await connectWallet();
      return;
    }
    setIsTxPending(true);
    setTxMessage('Submitting Escrow Deposit to GenLayer StudioNet...');
    setErrorMsg(null);
    try {
      const client = getClient();
      const weiDeposit = BigInt(Math.floor(parseFloat(amountGen) * 1e18));

      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'create_offset_order',
        args: [geoBounds, targetNdvi, durationBlocks],
        value: weiDeposit,
      });

      setTxMessage('Escrow order submitted! Awaiting consensus confirmation...');
      await (client as any).waitForTransactionReceipt({ hash: tx });
      setIsCreateOpen(false);
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      console.error('Create order error:', err);
      setErrorMsg(err.message || 'Transaction failed');
    } finally {
      setIsTxPending(false);
      setTxMessage('');
    }
  };

  const handleSubmitFeeds = async (orderId: number, satUrl: string, iotUrl: string) => {
    if (!account) {
      await connectWallet();
      return;
    }
    setIsTxPending(true);
    setTxMessage(`Claiming Order #${orderId} & Linking Telemetry Feeds...`);
    setErrorMsg(null);
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'submit_monitoring_feeds',
        args: [orderId, satUrl, iotUrl],
      });

      setTxMessage('Feeds linked! Awaiting GenVM block inclusion...');
      await (client as any).waitForTransactionReceipt({ hash: tx });
      setTelemetryTargetId(null);
      await fetchContractState();
    } catch (err: any) {
      console.error('Submit feeds error:', err);
      setErrorMsg(err.message || 'Transaction failed');
    } finally {
      setIsTxPending(false);
      setTxMessage('');
    }
  };

  const handleAdjudicate = async (orderId: number) => {
    if (!account) {
      await connectWallet();
      return;
    }
    setIsTxPending(true);
    setTxMessage(
      `Convening AI Environmental Jury for Order #${orderId}... GenVM validators rendering satellite telemetry & analyzing NDVI.`
    );
    setErrorMsg(null);
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'adjudicate_offset',
        args: [orderId],
      });

      setTxMessage('AI consensus reached! Finalizing verdict on StudioNet...');
      await (client as any).waitForTransactionReceipt({ hash: tx });
      await fetchContractState();
    } catch (err: any) {
      console.error('Adjudication error:', err);
      setErrorMsg(err.message || 'Adjudication failed');
    } finally {
      setIsTxPending(false);
      setTxMessage('');
    }
  };

  const handleAppealSubmit = async (orderId: number, reason: string, bondWei: string) => {
    if (!account) {
      await connectWallet();
      return;
    }
    setIsTxPending(true);
    setTxMessage(`Staking 10% Dispute Bond and Filing Appeal for Order #${orderId}...`);
    setErrorMsg(null);
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'appeal_verdict',
        args: [orderId, reason],
        value: BigInt(bondWei),
      });

      setTxMessage('Appeal filed! Awaiting confirmation...');
      await (client as any).waitForTransactionReceipt({ hash: tx });
      setAppealOrder(null);
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      console.error('Appeal error:', err);
      setErrorMsg(err.message || 'Appeal failed');
    } finally {
      setIsTxPending(false);
      setTxMessage('');
    }
  };

  const handleAdjudicateAppeal = async (orderId: number, supplementalUrl: string) => {
    if (!account) {
      await connectWallet();
      return;
    }
    setIsTxPending(true);
    setTxMessage(
      `Supreme Space Court Deliberating on Order #${orderId}... Multi-spectral review underway.`
    );
    setErrorMsg(null);
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'adjudicate_appeal',
        args: [orderId, supplementalUrl],
      });

      setTxMessage('Appellate verdict rendered! Re-routing funds and bonds...');
      await (client as any).waitForTransactionReceipt({ hash: tx });
      setAppealOrder(null);
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      console.error('Adjudicate appeal error:', err);
      setErrorMsg(err.message || 'Appellate adjudication failed');
    } finally {
      setIsTxPending(false);
      setTxMessage('');
    }
  };

  const handleFinalize = async (orderId: number) => {
    if (!account) {
      await connectWallet();
      return;
    }
    setIsTxPending(true);
    setTxMessage(`Finalizing settlement payout for Order #${orderId}...`);
    setErrorMsg(null);
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'finalize_settlement',
        args: [orderId],
      });

      setTxMessage('Payout released to developer/buyer! Awaiting receipt...');
      await (client as any).waitForTransactionReceipt({ hash: tx });
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      console.error('Finalize error:', err);
      setErrorMsg(err.message || 'Finalization failed');
    } finally {
      setIsTxPending(false);
      setTxMessage('');
    }
  };

  const handleCancelOrReclaim = async (orderId: number) => {
    if (!account) {
      await connectWallet();
      return;
    }
    setIsTxPending(true);
    setTxMessage(`Reclaiming escrow deposit for Order #${orderId}...`);
    setErrorMsg(null);
    try {
      const client = getClient();
      const tx = await (client as any).writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        functionName: 'cancel_or_reclaim',
        args: [orderId],
      });

      await (client as any).waitForTransactionReceipt({ hash: tx });
      await fetchContractState();
      if (account) fetchBalance(account);
    } catch (err: any) {
      console.error('Reclaim error:', err);
      setErrorMsg(err.message || 'Reclaim failed');
    } finally {
      setIsTxPending(false);
      setTxMessage('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar
        account={account}
        balance={balance}
        isConnecting={isConnecting}
        onConnect={connectWallet}
        onRefresh={fetchContractState}
        isLoading={isLoadingData}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Banner Notification for TX Processing */}
        {isTxPending && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-900 text-white shadow-lg flex items-center space-x-3 animate-pulse">
            <RefreshCw className="h-5 w-5 animate-spin text-emerald-400 shrink-0" />
            <div className="text-sm font-medium">{txMessage}</div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs font-mono">{errorMsg}</div>
          </div>
        )}

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-semibold mb-2">
              <Satellite className="h-3.5 w-3.5 text-emerald-700" />
              <span>Copernicus & NASA Remote Sensing + GenVM Semantic Consensus</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-space font-bold tracking-tight text-slate-900">
              Autonomous Carbon Offset Escrow
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Eliminating carbon credit greenwashing with trustless AI satellite verification. Buyers lock GEN in escrow; funds release only when multi-spectral canopy index meets strict ecological thresholds.
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Offset Order</span>
            </button>
          </div>
        </div>

        {/* Global Statistics */}
        <StatsOverview stats={stats} totalOrders={orders.length} />

        {/* Orders Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-space font-bold text-slate-900">
              Active Carbon Parcels & Escrows
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
              {orders.length}
            </span>
          </div>
        </div>

        {/* Order Cards Grid */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Satellite className="h-7 w-7" />
            </div>
            <h3 className="font-space font-bold text-lg text-slate-900">
              No Carbon Escrows Active Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Be the first to create a satellite-audited carbon offset parcel on GenLayer StudioNet.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Offset Order</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map((ord) => (
              <OrderCard
                key={ord.order_id}
                order={ord}
                currentAccount={account}
                onOpenSubmitFeeds={(id) => setTelemetryTargetId(id)}
                onAdjudicate={(id) => handleAdjudicate(id)}
                onOpenAppeal={(o) => setAppealOrder(o)}
                onFinalize={(id) => handleFinalize(id)}
                onCancelOrReclaim={(id) => handleCancelOrReclaim(id)}
                onInspect={(o) => setInspectOrder(o)}
                isProcessing={isTxPending}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            AgentCarbon Protocol &middot; GenLayer StudioNet (Chain ID: 61999)
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={`https://genlayer-explorer.vercel.app/address/${DEFAULT_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-600 transition-colors"
            >
              View Contract on Explorer
            </a>
            <span>&middot;</span>
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-600 transition-colors"
            >
              GenLayer Studio
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateOffsetModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateOrder}
        isSubmitting={isTxPending}
      />

      <TelemetrySubmitModal
        isOpen={telemetryTargetId !== null}
        orderId={telemetryTargetId}
        onClose={() => setTelemetryTargetId(null)}
        onSubmit={handleSubmitFeeds}
        isSubmitting={isTxPending}
      />

      <SatelliteInspectorModal
        isOpen={inspectOrder !== null}
        order={inspectOrder}
        onClose={() => setInspectOrder(null)}
      />

      <AppealModal
        isOpen={appealOrder !== null}
        order={appealOrder}
        onClose={() => setAppealOrder(null)}
        onSubmitAppeal={handleAppealSubmit}
        onSubmitAdjudicateAppeal={handleAdjudicateAppeal}
        isSubmitting={isTxPending}
      />
    </div>
  );
}

export default App;
