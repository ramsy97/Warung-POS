import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Tag, 
  Truck, 
  Users, 
  FilePlus, 
  RefreshCw, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  BarChart3, 
  UserCheck, 
  History,
  Store
} from 'lucide-react';

interface SidebarProps {
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  // Define menu items with roles allowed to access them
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, allowed: ['super_admin', 'owner', 'kasir'] },
    { path: '/pos', label: 'POS (Kasir)', icon: ShoppingCart, allowed: ['super_admin', 'owner', 'kasir'] },
    { path: '/products', label: 'Produk', icon: Package, allowed: ['super_admin', 'owner', 'staff_gudang'] },
    { path: '/categories', label: 'Kategori', icon: Tag, allowed: ['super_admin', 'owner', 'staff_gudang'] },
    { path: '/suppliers', label: 'Supplier', icon: Truck, allowed: ['super_admin', 'owner', 'staff_gudang'] },
    { path: '/customers', label: 'Pelanggan', icon: Users, allowed: ['super_admin', 'owner', 'kasir'] },
    { path: '/purchases', label: 'Pembelian', icon: FilePlus, allowed: ['super_admin', 'owner', 'staff_gudang'] },
    { path: '/stock', label: 'Stok', icon: RefreshCw, allowed: ['super_admin', 'owner', 'staff_gudang'] },
    { path: '/cash', label: 'Kas', icon: DollarSign, allowed: ['super_admin', 'owner', 'kasir'] },
    { path: '/debts', label: 'Hutang', icon: TrendingDown, allowed: ['super_admin', 'owner'] },
    { path: '/receivables', label: 'Piutang', icon: TrendingUp, allowed: ['super_admin', 'owner', 'kasir'] },
    { path: '/reports', label: 'Laporan', icon: BarChart3, allowed: ['super_admin', 'owner'] },
    { path: '/users', label: 'User Management', icon: UserCheck, allowed: ['super_admin'] },
    { path: '/audit', label: 'Audit Logs', icon: History, allowed: ['super_admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.allowed.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl select-none shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 bg-slate-950">
        <Store className="h-7 w-7 text-sky-400 stroke-[2.5]" />
        <div>
          <h1 className="font-extrabold text-lg leading-tight tracking-wider bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            WARUNGKITA
          </h1>
          <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
            Smart POS System
          </span>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {filteredItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`
              }
            >
              <IconComponent className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Role Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 border border-slate-700">
            {role.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Hak Akses</p>
            <p className="text-sm font-bold text-slate-300 truncate tracking-wide">
              {role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
