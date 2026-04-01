import React, { useEffect, useState } from 'react';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { ArrowRightLeft, TrendingUp, Zap, Wallet, Shield, Settings, ChevronRight, Plus, Eye, EyeOff, Copy, ExternalLink, LogOut } from 'lucide-react';

const PRIVY_APP_ID = 'your_privy_app_id'; // REPLACE WITH YOUR PRIVY APP ID
const ZAPPER_API_KEY = 'your_zapper_api_key'; // OPTIONAL: For portfolio data
const LIFI_API_KEY = 'your_lifi_api_key'; // Optional for better quotes

// ============================================================================
// Main Application
// ============================================================================

function AppContent() {
  const { user, logout, ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [showBalance, setShowBalance] = useState(true);
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Get wallet address
  useEffect(() => {
    if (wallets.length > 0) {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
      if (embeddedWallet) {
        setWalletAddress(embeddedWallet.address);
      }
    }
  }, [wallets]);

  // Fetch portfolio data from blockchain
  const fetchPortfolio = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      // Using public RPC endpoints (no auth needed)
      const chains = {
        ethereum: { id: 1, rpc: 'https://eth.llamarpc.com', name: 'Ethereum' },
        arbitrum: { id: 42161, rpc: 'https://arb1.arbitrum.io/rpc', name: 'Arbitrum' },
        optimism: { id: 10, rpc: 'https://mainnet.optimism.io', name: 'Optimism' },
        base: { id: 8453, rpc: 'https://mainnet.base.org', name: 'Base' },
        polygon: { id: 137, rpc: 'https://polygon-rpc.com', name: 'Polygon' },
      };

      const portfolioData = {
        address: walletAddress,
        totalBalance: 0,
        assets: [],
        chains: {}
      };

      // Fetch ETH balance on multiple chains
      for (const [chainName, chainInfo] of Object.entries(chains)) {
        try {
          const response = await fetch(chainInfo.rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [walletAddress, 'latest'],
              id: 1,
            }),
          });

          const data = await response.json();
          const balanceWei = data.result;
          const balanceEth = parseInt(balanceWei, 16) / 1e18;

          // Mock ETH price for demo (in production, use real price API)
          const ethPrice = 3500;
          const chainValue = balanceEth * ethPrice;

          portfolioData.chains[chainName] = {
            balance: balanceEth,
            value: chainValue,
            name: chainInfo.name,
          };

          portfolioData.totalBalance += chainValue;
        } catch (error) {
          console.error(`Error fetching ${chainName}:`, error);
        }
      }

      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch portfolio when wallet is available
  useEffect(() => {
    if (walletAddress) {
      fetchPortfolio();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPortfolio, 30000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  // Login screen
  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Shield className="text-white" size={32} />
          </div>

          <h1 className="text-5xl font-black text-white mb-2">Bank 3.0</h1>
          <p className="text-cyan-400 font-semibold mb-8">Non-Custodial • Self-Hosted • Mainnet Ready</p>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <p className="text-slate-300 mb-6 text-sm">
              Sign in with your wallet to access DeFi, staking, trading, and payments all in one place.
            </p>

            {/* Privy will auto-inject login button here */}
            <div className="privy-login-wrapper">
              <p className="text-slate-400 text-xs mb-4">
                Click the "Sign in with Privy" button that appeared in the top right
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/30 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Shield className="text-emerald-400 flex-shrink-0 mt-1" size={18} />
                <div className="text-sm">
                  <p className="text-white font-semibold">Non-Custodial</p>
                  <p className="text-slate-400">Your keys, your crypto. Always.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="text-yellow-400 flex-shrink-0 mt-1" size={18} />
                <div className="text-sm">
                  <p className="text-white font-semibold">Multi-Chain</p>
                  <p className="text-slate-400">Ethereum, Arbitrum, Base, more.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="text-cyan-400 flex-shrink-0 mt-1" size={18} />
                <div className="text-sm">
                  <p className="text-white font-semibold">Full DeFi</p>
                  <p className="text-slate-400">Swaps, staking, perps, and more.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-white font-black text-xl">Bank 3.0</h1>
                <p className="text-cyan-400 text-xs font-semibold">Mainnet • Self-Custodial</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-slate-400 text-xs">Wallet</p>
                <p className="text-white font-mono text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-red-400"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'portfolio', label: 'Portfolio', icon: '💼' },
              { id: 'swap', label: 'Swap', icon: '⟷' },
              { id: 'staking', label: 'Stake', icon: '⚡' },
              { id: 'perps', label: 'Perps', icon: '📈' },
              { id: 'dapp', label: 'dApps', icon: '🔗' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          {activeTab === 'portfolio' && (
            <PortfolioTab 
              portfolio={portfolio} 
              loading={loading} 
              walletAddress={walletAddress}
              onRefresh={fetchPortfolio}
              showBalance={showBalance}
              setShowBalance={setShowBalance}
            />
          )}

          {activeTab === 'swap' && (
            <SwapTab walletAddress={walletAddress} portfolio={portfolio} />
          )}

          {activeTab === 'staking' && (
            <StakingTab walletAddress={walletAddress} />
          )}

          {activeTab === 'perps' && (
            <PerpsTab walletAddress={walletAddress} />
          )}

          {activeTab === 'dapp' && (
            <DAppTab walletAddress={walletAddress} />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// PORTFOLIO TAB
// ============================================================================

function PortfolioTab({ portfolio, loading, walletAddress, onRefresh, showBalance, setShowBalance }) {
  const formatUSD = (num) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num);

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Zap className="text-cyan-400 mx-auto" size={32} />
          </div>
          <p className="text-slate-300">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-900 via-slate-900 to-slate-950 p-8 border border-cyan-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-cyan-300/70 text-sm font-semibold uppercase tracking-widest mb-2">Total Balance</p>
              <div className="flex items-baseline gap-3">
                {!showBalance ? (
                  <div className="text-4xl font-bold text-white">••••••</div>
                ) : (
                  <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-200">
                    {formatUSD(portfolio.totalBalance)}
                  </h1>
                )}
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-cyan-400 hover:text-cyan-300 transition"
                >
                  {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="text-4xl hover:scale-110 transition disabled:opacity-50"
            >
              🔄
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <p className="text-cyan-300/60 text-xs uppercase tracking-wider mb-2">Status</p>
              <p className="text-white font-bold text-lg">Mainnet</p>
              <p className="text-emerald-400 text-sm">Live</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <p className="text-cyan-300/60 text-xs uppercase tracking-wider mb-2">Networks</p>
              <p className="text-white font-bold text-lg">{Object.keys(portfolio.chains).length}</p>
              <p className="text-emerald-400 text-sm">Connected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:border-cyan-500/30 transition cursor-pointer group">
        <div className="flex items-center gap-3">
          <Wallet className="text-cyan-400" size={20} />
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Connected Address</p>
            <p className="text-white font-mono font-bold">{walletAddress}</p>
          </div>
        </div>
        <a
          href={`https://etherscan.io/address/${walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 group-hover:text-cyan-400 transition"
        >
          <ExternalLink size={20} />
        </a>
      </div>

      {/* Multi-Chain View */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-500"></span>
          Multi-Chain Balances
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(portfolio.chains).map(([key, chain]) => (
            <div
              key={key}
              className="p-4 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition bg-slate-800/30"
            >
              <p className="text-white font-bold text-sm mb-2">{chain.name}</p>
              <p className="text-cyan-400 font-bold">{chain.balance.toFixed(4)} ETH</p>
              <p className="text-slate-400 text-xs">{formatUSD(chain.value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
        <p className="text-slate-400 text-sm">
          💡 <strong>Tip:</strong> Your balances update automatically every 30 seconds. Connect more wallets in your Privy account to see them here.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SWAP TAB - Links to LI.FI
// ============================================================================

function SwapTab({ walletAddress, portfolio }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-8 border border-cyan-500/20">
        <h2 className="text-white font-bold text-2xl mb-2">Cross-Chain Swap</h2>
        <p className="text-slate-400 text-sm mb-6">Powered by LI.FI - Swap across 40+ chains instantly</p>

        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 mb-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-16 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-center justify-center">
              <span className="text-slate-400">From: ETH, USDC, etc.</span>
            </div>
            <ArrowRightLeft className="text-cyan-400" size={24} />
            <div className="flex-1 h-16 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-center justify-center">
              <span className="text-slate-400">To: Any token, any chain</span>
            </div>
          </div>

          <a
            href="https://app.li.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>Open LI.FI Swap</span>
            <ExternalLink size={18} />
          </a>
        </div>

        <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Supported Chains</span>
            <span className="text-white font-semibold">40+</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Liquidity Sources</span>
            <span className="text-white font-semibold">100+</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">24h Volume</span>
            <span className="text-emerald-400 font-semibold">$2.3B+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAKING TAB - Links to popular protocols
// ============================================================================

function StakingTab({ walletAddress }) {
  const stakingProtocols = [
    {
      name: 'Lido',
      url: 'https://stake.lido.io',
      apy: '3.5%',
      asset: 'ETH',
      description: 'Liquid staking for Ethereum',
    },
    {
      name: 'Aave',
      url: 'https://aave.com',
      apy: '5.2%',
      asset: 'USDC',
      description: 'Earn on your stablecoins',
    },
    {
      name: 'Compound',
      url: 'https://compound.finance',
      apy: '4.8%',
      asset: 'USDC',
      description: 'Leading lending protocol',
    },
    {
      name: 'Rocket Pool',
      url: 'https://rocketpool.net',
      apy: '3.8%',
      asset: 'ETH',
      description: 'Decentralized staking',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Zap className="text-yellow-400" size={20} />
          Top Staking Opportunities
        </h2>
        <div className="space-y-3">
          {stakingProtocols.map((protocol) => (
            <a
              key={protocol.name}
              href={protocol.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:border-cyan-500/30 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold group-hover:text-cyan-400 transition">{protocol.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{protocol.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-lg">{protocol.apy}</p>
                  <p className="text-slate-400 text-xs">{protocol.asset}</p>
                </div>
              </div>
              <button className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-cyan-300 font-semibold py-2 rounded-lg transition text-sm group-hover:bg-cyan-500/20">
                Go to {protocol.name} →
              </button>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
        <p className="text-slate-400 text-sm">
          ⚠️ <strong>Note:</strong> Staking involves smart contract risk. Always review the protocol audits before depositing.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// PERPS TAB - Links to GMX and Hyperliquid
// ============================================================================

function PerpsTab({ walletAddress }) {
  const perpsPlatforms = [
    {
      name: 'Hyperliquid',
      url: 'https://hyperliquid.exchange',
      leverage: '50x',
      volume: '$3.2B',
      description: 'Ultra-low latency perps on proprietary chain',
    },
    {
      name: 'GMX v2',
      url: 'https://gmx.io',
      leverage: '25x',
      volume: '$1.8B',
      description: 'Most liquid perps DEX on Arbitrum',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-red-500/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-orange-500"></div>
          <h2 className="text-white font-bold text-xl">Perpetual Futures</h2>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          ⚠️ <strong>HIGH RISK:</strong> Perpetual futures trading involves leverage and liquidation risk. Use with extreme caution and never risk more than you can afford to lose.
        </p>

        <div className="space-y-3">
          {perpsPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-900/50 border border-red-500/30 rounded-lg p-4 hover:border-red-500/60 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold group-hover:text-red-400 transition">{platform.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{platform.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold">{platform.leverage}</p>
                  <p className="text-slate-400 text-xs">Max Leverage</p>
                </div>
              </div>
              <div className="flex justify-between mb-3 text-sm">
                <span className="text-slate-400">24h Volume: {platform.volume}</span>
              </div>
              <button className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-2 rounded-lg transition text-sm border border-red-500/50">
                Access {platform.name} →
              </button>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// dAPP TAB - Links to popular DeFi apps
// ============================================================================

function DAppTab({ walletAddress }) {
  const dapps = [
    {
      name: 'Uniswap',
      url: 'https://app.uniswap.org',
      category: 'Swap',
      icon: '🔄',
      description: 'Leading DEX with lowest fees',
    },
    {
      name: 'Curve Finance',
      url: 'https://curve.fi',
      category: 'Stableswap',
      icon: '📈',
      description: 'Best rates for stablecoin swaps',
    },
    {
      name: 'Balancer',
      url: 'https://balancer.fi',
      category: 'Liquidity',
      icon: '⚖️',
      description: 'Flexible liquidity pools',
    },
    {
      name: 'Convex',
      url: 'https://www.convexfinance.com',
      category: 'Yield',
      icon: '📊',
      description: 'Optimize Curve.fi yields',
    },
    {
      name: 'Yearn',
      url: 'https://yearn.finance',
      category: 'Vaults',
      icon: '🏦',
      description: 'Automated yield farming',
    },
    {
      name: 'OpenSea',
      url: 'https://opensea.io',
      category: 'NFTs',
      icon: '🎨',
      description: 'NFT marketplace',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <span>🔗</span>
          Popular DeFi dApps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dapps.map((dapp) => (
            <a
              key={dapp.name}
              href={dapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:border-cyan-500/30 transition group"
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">{dapp.icon}</span>
                <div className="flex-1">
                  <h3 className="text-white font-bold group-hover:text-cyan-400 transition">{dapp.name}</h3>
                  <p className="text-cyan-400 text-xs font-semibold">{dapp.category}</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">{dapp.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main App with Privy Provider
// ============================================================================

export default function App() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#06b6d4',
        },
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
        loginMethods: ['email', 'sms', 'google', 'farcaster', 'wallet'],
        defaultChain: 'ethereum',
      }}
    >
      <AppContent />
    </PrivyProvider>
  );
}
