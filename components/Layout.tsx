import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  BarChart3, ShoppingBag, Truck, Search, Menu
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Visão Geral', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'PDV (Vendas)', path: '/pos', icon: <ShoppingCart size={20} /> },
    { label: 'Cadastro de Produtos', path: '/products', icon: <Package size={20} /> }, // Renamed from Catálogo
    { label: 'Compras', path: '/purchases', icon: <ShoppingBag size={20} /> },
    { label: 'Controle de Estoque', path: '/stock', icon: <Truck size={20} /> }, // Updated path and label
    { label: 'Clientes', path: '/customers', icon: <Users size={20} /> },
    { label: 'Relatórios', path: '/reports', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans">
      {/* Top Header - Dark like MarketUP */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50 shadow-md no-print">
        <div className="flex items-center gap-4 w-64">
           {/* Logo Area */}
           <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
             <div className="bg-green-500 p-1 rounded text-slate-900">
               <ShoppingCart size={20} strokeWidth={3} />
             </div>
             <span>Mercado<span className="text-green-500">Fácil</span></span>
           </div>
        </div>

        {/* Central Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Procure por produtos, clientes ou pedidos..." 
              className="w-full bg-slate-800 text-slate-200 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-green-500 outline-none text-sm placeholder-slate-500 transition-all"
            />
            <Search className="absolute left-3 top-2 text-slate-500" size={18} />
          </div>
        </div>

        {/* Right Actions - REMOVED BELL, SETTINGS, HELP as requested */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-px bg-slate-700 mx-2"></div>

          <div className="flex items-center gap-3 cursor-pointer group relative" onClick={handleLogout} title="Sair">
             <div className="text-right hidden md:block leading-tight">
               <p className="text-sm font-semibold text-white">{user?.name}</p>
               <p className="text-xs text-green-500 uppercase">{user?.role}</p>
             </div>
             <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold border-2 border-slate-800 group-hover:border-green-400 transition">
               {user?.name.charAt(0)}
             </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-800 text-slate-300 flex flex-col shadow-xl z-40 no-print transition-all">
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-3 transition-all border-l-4
                ${isActive 
                  ? 'bg-slate-700 text-white border-green-500' 
                  : 'border-transparent hover:bg-slate-700/50 hover:text-white'}
              `}
            >
              <div className={({ isActive }: any) => isActive ? "text-green-400" : "text-slate-400"}>
                {item.icon}
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 bg-slate-900 border-t border-slate-700">
           <p className="text-xs text-center text-slate-500">v1.1.0 - Mercado Fácil</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 mt-16 w-full p-6 overflow-y-auto h-[calc(100vh-4rem)] bg-slate-100">
        <div className="max-w-7xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;