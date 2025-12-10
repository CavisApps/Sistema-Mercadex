import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, ArrowRight, ShoppingCart, TrendingUp, Package, Search, Filter, ShoppingBag 
} from 'lucide-react';

const Dashboard = () => {
  const { sales, products, purchases } = useStore();

  // Stats Logic
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const todaysSales = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
  const totalSalesToday = todaysSales.reduce((acc, s) => acc + s.total, 0);
  
  // Recent Sales (Last 10)
  const recentSales = [...sales].reverse().slice(0, 8);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Sales List (Like "Pedidos" in MarketUP) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header Block */}
        <div className="bg-white rounded-t-lg border border-slate-200 p-4 flex justify-between items-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 p-1 rounded"><ShoppingCart size={18}/></span>
            Vendas Recentes
          </h2>
          <div className="flex gap-2">
             <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Search size={18}/></button>
             <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Filter size={18}/></button>
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white border-x border-b border-slate-200 rounded-b-lg shadow-sm overflow-hidden">
          {recentSales.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <p>Nenhuma venda registrada ainda.</p>
              <Link to="/pos" className="text-blue-500 hover:underline mt-2 inline-block">Ir para o PDV</Link>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4 w-20 text-center">ID</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Pagamento</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 text-center">
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono text-xs font-bold">
                        #{sale.id.slice(-4)}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {sale.customerName || 'Consumidor Final'}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(sale.date).toLocaleDateString()} <span className="text-xs">{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="p-4 text-slate-600 capitalize">
                      {sale.paymentMethod.replace('_', ' ').toLowerCase()}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-800">
                      R$ {sale.total.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                       <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">CONCLUÍDO</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="bg-slate-50 p-3 text-center border-t border-slate-200">
            <Link to="/reports" className="text-sm text-blue-600 font-medium hover:underline flex items-center justify-center gap-1">
              Ver todas as vendas <ArrowRight size={14}/>
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Widgets (Orange Alert Box) */}
      <div className="space-y-6">
        
        {/* Orange Widget - Inspired by MarketUP Alerts */}
        <div className="bg-orange-500 rounded-xl shadow-lg text-white overflow-hidden relative">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-lg font-bold flex items-center gap-2">
                 <AlertTriangle className="text-orange-200" />
                 Alertas e Resumo
               </h3>
               <span className="bg-orange-600 text-xs px-2 py-1 rounded text-orange-100">Hoje</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-orange-400 pb-2">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-600 rounded-lg"><TrendingUp size={20}/></div>
                   <div>
                     <p className="text-2xl font-bold">{todaysSales.length}</p>
                     <p className="text-orange-100 text-xs">Vendas Hoje</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">R$ {totalSalesToday.toFixed(0)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-600 rounded-lg"><Package size={20}/></div>
                   <div>
                     <p className="text-2xl font-bold">{lowStockItems.length}</p>
                     <p className="text-orange-100 text-xs">Itens Estoque Baixo</p>
                   </div>
                </div>
                <div>
                  <button className="bg-white text-orange-600 text-xs font-bold px-3 py-1 rounded hover:bg-orange-50">
                    Ver
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
               <Link to="/pos" className="bg-orange-600 hover:bg-orange-700 text-center py-2 rounded-lg font-semibold transition shadow-md border border-orange-400">
                 FATURAR (PDV)
               </Link>
               <Link to="/purchases" className="bg-white text-orange-600 hover:bg-orange-50 text-center py-2 rounded-lg font-semibold transition shadow-md">
                 COMPRAR
               </Link>
            </div>
          </div>
          
          {/* Decorative Circle */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-400 rounded-full opacity-50 blur-xl"></div>
        </div>

        {/* Secondary Widget - Product Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
             <ShoppingBag size={18} className="text-green-600"/> Produtos Mais Vendidos
           </h3>
           <ul className="space-y-3">
             {/* Mock "Top Products" logic based on existing sales */}
             {products.slice(0, 4).map((p, i) => (
               <li key={p.id} className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-3">
                   <span className="text-slate-400 font-mono text-xs">0{i+1}</span>
                   <span className="text-slate-700 font-medium">{p.name}</span>
                 </div>
                 <span className="text-green-600 font-bold">{p.stock} un</span>
               </li>
             ))}
             {products.length === 0 && <li className="text-slate-400 text-sm">Sem dados.</li>}
           </ul>
        </div>
        
        {/* Banner Mock */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white text-center">
           <p className="font-bold text-lg mb-1">Mercado Premium</p>
           <p className="text-sm opacity-90 mb-3">Obtenha relatórios avançados!</p>
           <button className="bg-white text-purple-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-slate-100">
             Saiba Mais
           </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;