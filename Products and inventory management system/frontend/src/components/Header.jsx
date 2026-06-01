import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#0c0b0f] border-b border-zinc-800/60 flex items-center justify-between px-8 select-none">
      <div>
        <h2 className="text-zinc-200 text-sm font-semibold tracking-tight uppercase letter-wider">Admin Workspace</h2>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-zinc-400">
          <div className="w-7 h-7 bg-zinc-800/80 rounded-full flex items-center justify-center border border-zinc-700/40">
            <User className="w-4 h-4 text-violet-400 stroke-[2]" />
          </div>
          <span className="font-medium text-xs">{user?.email || 'admin@inventrix.com'}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-zinc-500 hover:text-red-400 text-xs font-medium transition-all duration-150 py-1.5 px-3 rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/10 cursor-pointer"
        >
          <LogOut className="w-4 h-4 stroke-[1.75]" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
