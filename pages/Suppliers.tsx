import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Supplier } from '../types';
import { Plus, Trash2, Truck } from 'lucide-react';

const Suppliers = () => {
  const { suppliers, addSupplier, deleteSupplier } = useStore();
  const [form, setForm] = useState<Omit<Supplier, 'id'>>({ name: '', cnpj: '', contact: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier({ ...form, id: Date.now().toString() });
    setForm({ name: '', cnpj: '', contact: '', phone: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este fornecedor?')) {
      deleteSupplier(id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
          <Plus size={20} className="text-blue-600"/> Novo Fornecedor
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social / Nome</label>
            <input 
              required 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Distribuidora Silva"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
            <input 
              required 
              value={form.cnpj} 
              onChange={e => setForm({...form, cnpj: e.target.value})} 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Contato</label>
            <input 
              required 
              value={form.contact} 
              onChange={e => setForm({...form, contact: e.target.value})} 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: João"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
            <input 
              required 
              value={form.phone} 
              onChange={e => setForm({...form, phone: e.target.value})} 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="(00) 00000-0000"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
            Cadastrar Fornecedor
          </button>
        </form>
      </div>

      {/* List Section */}
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
                      onClick={() => handleDelete(s.id)}
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
  );
};

export default Suppliers;