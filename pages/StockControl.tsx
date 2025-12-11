import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Truck, Plus, Trash2, Package } from 'lucide-react';
import { Supplier } from '../types';

const StockControl = () => {
  const { products, purchases, sales, suppliers, addSupplier, deleteSupplier } = useStore();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SUPPLIERS'>('OVERVIEW');

  // Supplier Form State
  const [supplierForm, setSupplierForm] = useState<Omit<Supplier, 'id'>>({ name: '', cnpj: '', contact: '', phone: '' });

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier({ ...supplierForm, id: Date.now().toString() });
    setSupplierForm({ name: '', cnpj: '', contact: '', phone: '' });
  };

  const handleSupplierDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este fornecedor?')) {
      deleteSupplier(id);
    }
  };

  const stockData = useMemo(() => {
    return products.map(product => {
       // Calculate Total Bought
       const totalBought = purchases.reduce((acc, purchase) => {
         const item = purchase.items.find(i => i.productId === product.id);
         return acc + (item ? item.quantity : 0);
       }, 0);

       // Last Supplier
       const lastPurchase = [...purchases]
         .reverse()
         .find(p => p.items.some(i => i.productId === product.id));

       // Calculate Total Sold
       const totalSold = sales.reduce((acc, sale) => {
         const item = sale.items.find(i => i.id === product.id);
         return acc + (item ? item.quantity : 0);
       }, 0);

       return {
         ...product,
         totalBought,
         totalSold,
         lastSupplier: lastPurchase ? lastPurchase.supplier : 'N/A'
       };
    });
  }, [products, purchases, sales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Truck /> Controle de Estoque
        </h2>
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex">
            <button 
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${activeTab === 'OVERVIEW' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                Visão Geral
            </button>
            <button 
                onClick={() => setActiveTab('SUPPLIERS')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${activeTab === 'SUPPLIERS' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                Gerenciar Fornecedores
            </button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="p-4 text-slate-600">Produto</th>
                        <th className="p-4 text-slate-600">Fornecedor (Último)</th>
                        <th className="p-4 text-slate-600 text-center">Total Comprado</th>
                        <th className="p-4 text-slate-600 text-center">Total Vendido</th>
                        <th className="p-4 text-slate-600 text-center">Estoque Atual</th>
                        <th className="p-4 text-slate-600 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {stockData.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-4 font-medium">{p.name}</td>
                            <td className="p-4 text-sm text-slate-500">{p.lastSupplier}</td>
                            <td className="p-4 text-center text-blue-600 font-bold">{p.totalBought}</td>
                            <td className="p-4 text-center text-green-600 font-bold">{p.totalSold}</td>
                            <td className="p-4 text-center text-lg font-bold">{p.stock}</td>
                            <td className="p-4 text-center">
                                {p.stock <= p.minStock ? (
                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">BAIXO</span>
                                ) : (
                                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">NORMAL</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {activeTab === 'SUPPLIERS' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Supplier Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                <Plus size={20} className="text-blue-600"/> Novo Fornecedor
                </h3>
                <form onSubmit={handleSupplierSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social / Nome</label>
                    <input 
                    required 
                    value={supplierForm.name} 
                    onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} 
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Distribuidora Silva"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                    <input 
                    required 
                    value={supplierForm.cnpj} 
                    onChange={e => setSupplierForm({...supplierForm, cnpj: e.target.value})} 
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="00.000.000/0000-00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Contato</label>
                    <input 
                    required 
                    value={supplierForm.contact} 
                    onChange={e => setSupplierForm({...supplierForm, contact: e.target.value})} 
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: João"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                    <input 
                    required 
                    value={supplierForm.phone} 
                    onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} 
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="(00) 00000-0000"
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
                    Cadastrar Fornecedor
                </button>
                </form>
            </div>

            {/* Supplier List */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Truck size={20} className="text-slate-500"/>
                <h3 className="font-semibold text-slate-700">Fornecedores Cadastrados</h3>
                </div>
                <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-100">
                    <tr>
                    <th className="p-4 font-semibold text-slate-600">Empresa</th>
                    <th className="p-4 font-semibold text-slate-600">CNPJ</th>
                    <th className="p-4 font-semibold text-slate-600">Contato</th>
                    <th className="p-4 font-semibold text-slate-600 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {suppliers.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum fornecedor cadastrado.</td></tr>
                    ) : (
                    suppliers.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                            <p className="font-medium text-slate-800">{s.name}</p>
                        </td>
                        <td className="p-4 text-slate-600 text-sm font-mono">{s.cnpj}</td>
                        <td className="p-4 text-slate-600 text-sm">
                            <p>{s.contact}</p>
                            <p className="text-xs text-slate-400">{s.phone}</p>
                        </td>
                        <td className="p-4 text-right">
                            <button 
                            onClick={() => handleSupplierDelete(s.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Excluir"
                            >
                            <Trash2 size={18} />
                            </button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
         </div>
      )}
    </div>
  );
};

export default StockControl;