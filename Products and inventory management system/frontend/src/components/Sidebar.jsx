import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
];

const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const Sidebar = () => {
  return (
    <div className="w-64 bg-[#12111a] border-r border-zinc-800/60 flex flex-col min-h-screen text-zinc-100 select-none">
      {/* Brand logomark */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <IconBox />
          </div>
          <span className="font-semibold text-base tracking-tight text-white">
            Invent<em className="text-violet-400 not-italic font-medium">rix</em>
          </span>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border ${
                isActive 
                  ? 'bg-violet-600/10 text-violet-400 border-violet-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border-transparent'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px] stroke-[1.75]" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Badge */}
      <div className="p-4 border-t border-zinc-800/40 text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50 uppercase tracking-wider">
          v1.0.0 Stable
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
