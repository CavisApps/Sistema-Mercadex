import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const emptyForm: Omit<Product, 'id'> = {
    barcode: '', name: '', unit: 'un', costPrice: 0, margin: 0, sellPrice: 0, 
    stock: 0, minStock: 5, category: 'Geral', description: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  const calculateSellPrice = (cost: number, margin: number) => {
    return cost * (1 + margin / 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate sell price logic
      if (name === 'costPrice' || name === 'margin') {
        const cost = name === 'costPrice' ? parseFloat(value) || 0 : prev.costPrice;
        const margin = name === 'margin' ? parseFloat(value) || 0 : prev.margin;
        newData.sellPrice = calculateSellPrice(cost, margin);
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: editingId || Date.now().toString(),
      ...formData,
      costPrice: Number(formData.costPrice),
      margin: Number(formData.margin),
      sellPrice: Number(formData.sellPrice),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
    };

    if (editingId) {
      updateProduct(product);
    } else {
      addProduct(product);
    }
    closeModal();
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.category.toLowerCase().includes(filter.toLowerCase()) ||
    p.barcode.includes(filter)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, categoria ou código..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Produto</th>
              <th className="p-4 font-semibold text-slate-600">Categoria</th>
              <th className="p-4 font-semibold text-slate-600">Estoque</th>
              <th className="p-4 font-semibold text-slate-600">Preço Custo</th>
              <th className="p-4 font-semibold text-slate-600">Margem</th>
              <th className="p-4 font-semibold text-slate-600">Preço Venda</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.barcode}</p>
                  </div>
                </td>
                <td className="p-4 text-slate-600"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{p.category}</span></td>
                <td className="p-4">
                  <span className={`${p.stock <= p.minStock ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                    {p.stock} {p.unit}
                  </span>
                </td>
                <td className="p-4 text-slate-600">R$ {p.costPrice.toFixed(2)}</td>
                <td className="p-4 text-slate-600">{p.margin.toFixed(0)}%</td>
                <td className="p-4 font-bold text-slate-800">R$ {p.sellPrice.toFixed(2)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">
              {editingId ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Código de Barras</label>
                <input required name="barcode" value={formData.barcode} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input required name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                <select name="unit" value={formData.unit} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="un">Unidade (un)</option>
                  <option value="kg">Quilo (kg)</option>
                  <option value="lt">Litro (lt)</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Preço de Custo (R$)</label>
                <input type="number" step="0.01" required name="costPrice" value={formData.costPrice} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Margem (%)</label>
                <input type="number" step="0.1" required name="margin" value={formData.margin} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="col-span-2 bg-blue-50 p-4 rounded-lg flex items-center justify-between border border-blue-100">
                <span className="text-blue-800 font-medium">Preço de Venda Final:</span>
                <span className="text-2xl font-bold text-blue-700">R$ {Number(formData.sellPrice).toFixed(2)}</span>
                <input type="hidden" name="sellPrice" value={formData.sellPrice} />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Atual</label>
                <input type="number" required name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Mínimo</label>
                <input type="number" required name="minStock" value={formData.minStock} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="col-span-2">
                 <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">Descrição</label>
                 </div>
                 <textarea name="description" value={formData.description || ''} onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" rows={2} />
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;