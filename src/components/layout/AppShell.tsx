'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Activity, 
  Receipt, 
  BarChart3, 
  Settings,
  Leaf,
  Menu,
  X
} from 'lucide-react';
import { useUIStore } from '@/store';
import { WalletButton } from '@/components/wallet/WalletButton';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
  { label: 'Activity', icon: Activity, href: '/activity' },
  { label: 'Transactions', icon: Receipt, href: '/transactions' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const isLanding = pathname === '/';

  if (isLanding) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#020b12]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#061018] border-r border-[#10b981]/10 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-16 border-b border-[#10b981]/10">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#059669] to-[#10b981]">
              <Leaf size={16} color="white" />
            </div>
            <span className="font-bold text-[#e2f4ee] font-['Space_Grotesk'] tracking-tight">
              REC<span className="text-[#10b981]">Market</span>
            </span>
            <button 
              className="ml-auto p-1 md:hidden text-[#7fb3a0]"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' 
                      : 'text-[#7fb3a0] hover:bg-[#10b981]/5 hover:text-[#e2f4ee]'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={18} className={isActive ? 'text-[#10b981]' : 'group-hover:text-[#10b981]'} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="p-4 mt-auto border-t border-[#10b981]/10 bg-[#081420]/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">Testnet Active</span>
            </div>
            <p className="text-[10px] text-[#4a7a66] leading-relaxed">
              Soroban v21.7.6<br/>
              Network: Test SDF Network
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#10b981]/10 bg-[#020b12]/80 backdrop-blur-xl sticky top-0 z-30">
          <button 
            className="p-2 -ml-2 md:hidden text-[#7fb3a0]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-[#7fb3a0] uppercase tracking-widest">
              {NAV_ITEMS.find(n => n.href === pathname)?.label || 'Marketplace'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981]/5 border border-[#10b981]/10">
              <Activity size={14} className="text-[#10b981]" />
              <span className="text-xs font-medium text-[#7fb3a0]">Network Healthy</span>
            </div>
            <WalletButton />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="animate-fade-in pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
