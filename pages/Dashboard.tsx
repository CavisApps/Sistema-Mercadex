import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line
} from 'recharts';
import { DollarSign, ShoppingBag, Users, AlertTriangle, Sparkles, BarChart3 } from 'lucide-react';
import { analyzeSalesTrends } from '../services/geminiService';

const Card = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      <p className={`text-xs mt-2 ${sub.includes('-') ? 'text-red-500' : 'text-emerald-500'}`}>
        {sub}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const { sales, purchases, products, customers } = useStore();
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Calcs
  const totalSales = useMemo(() => sales.reduce((acc, s) => acc + s.total, 0), [sales]);
  const totalPurchases = useMemo(() => purchases.reduce((acc, p) => acc + p.total, 0), [purchases]);
  const estimatedProfit = totalSales - totalPurchases;
  const lowStockCount = useMemo(() => products.filter(p => p.stock <= p.minStock).length, [products]);
  
  // Chart Data Preparation
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const daySales = sales.filter(s => s.date.startsWith(date)).reduce((acc, s) => acc + s.total, 0);
    const dayPurchases = purchases.filter(p => p.date.startsWith(date)).reduce((acc, p) => acc + p.total, 0);
    return {
      name: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
      Vendas: daySales,
      Compras: dayPurchases
    };
  });

  const topProducts = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach(s => {
      s.items.forEach(i => {
        map[i.name] = (map[i.name] || 0) + i.quantity;
      });
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, qtd]) => ({ name, qtd }));
  }, [sales]);

  const handleGetInsight = async () => {
    if (!process.env.API_KEY) {
      alert("Configure a API_KEY para usar recursos de IA");
      return;
    }
    setLoadingAi(true);
    const summary = `Vendas totais: ${totalSales}. Lucro: ${estimatedProfit}. Produtos com estoque baixo: ${lowStockCount}. Top produto: ${topProducts[0]?.name || 'Nenhum'}.`;
    const insight = await analyzeSalesTrends(summary);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Vendas do Mês" 
          value={`R$ ${totalSales.toFixed(2)}`} 
          sub="+12% vs mês anterior" 
          icon={DollarSign} 
          color="bg-blue-500" 
        />
        <Card 
          title="Compras do Mês" 
          value={`R$ ${totalPurchases.toFixed(2)}`} 
          sub="Investimento em estoque" 
          icon={ShoppingBag} 
          color="bg-orange-500" 
        />
        <Card 
          title="Lucro Estimado" 
          value={`R$ ${estimatedProfit.toFixed(2)}`} 
          sub={estimatedProfit > 0 ? "Lucro positivo" : "Atenção necessária"} 
          icon={BarChart3} 
          color="bg-emerald-500" 
        />
        <Card 
          title="Clientes Ativos" 
          value={customers.length} 
          sub="Total cadastrado" 
          icon={Users} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Fluxo de Caixa (Últimos 7 dias)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="Vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Compras" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
           {/* Alerts */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              Alertas de Estoque
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {products.filter(p => p.stock <= p.minStock).length === 0 ? (
                 <p className="text-slate-500 text-sm">Estoque saudável.</p>
              ) : (
                products.filter(p => p.stock <= p.minStock).map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-red-600">Mínimo: {p.minStock}</p>
                    </div>
                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-bold">
                      {p.stock} {p.unit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl shadow-lg">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold flex items-center gap-2">
                 <Sparkles size={18} className="text-yellow-300" />
                 Smart Insights
               </h3>
               {!aiInsight && (
                 <button 
                  onClick={handleGetInsight} 
                  disabled={loadingAi}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
                 >
                   {loadingAi ? 'Gerando...' : 'Analisar'}
                 </button>
               )}
             </div>
             <p className="text-sm leading-relaxed text-indigo-100">
               {aiInsight || "Clique em analisar para receber dicas de IA sobre como melhorar seu lucro com base nos dados atuais."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;