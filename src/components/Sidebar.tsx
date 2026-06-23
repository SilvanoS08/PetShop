import React from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  LayoutDashboard, 
  LogOut,
  PawPrint,
  Sun,
  Moon
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar = ({ isDarkMode, toggleTheme }: SidebarProps) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: Users, label: 'Clientes', to: '/clientes' },
    { icon: Package, label: 'Produtos', to: '/produtos' },
    { icon: ShoppingCart, label: 'Caixa', to: '/caixa' },
  ];

  return (
    <aside className="w-64 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-main)] flex flex-col fixed left-0 top-0 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
          <PawPrint size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">PetCare CRM</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              isActive 
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" 
                : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border-main)] space-y-2">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all font-medium"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-zinc-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all font-medium">
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
