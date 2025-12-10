import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Purchase, Customer } from '../types';
import { Plus, Download, FileText, UserPlus, Phone, Calendar } from 'lucide-react';
import { jsPDF } from "jspdf"; 

// --- PURCHASES COMPONENT ---
const Purchases = () => {
  const { products, addPurchase, purchases } = useStore();
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<{ productId: string, qty: number, cost: number }[]>([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [cost, setCost] = useState(0);

  const handleAddItem = () => {
    if (!currentProduct || qty <= 0) return;
    const prod = products.find(p => p.id === currentProduct);
    if (!prod) return;
    setItems([...items, { productId: currentProduct, qty, cost }]);
    setCurrentProduct(''); setQty(1); setCost(0);
  };

  const finalizePurchase = () => {
    if (items.length === 0 || !supplier) return;
    const purchaseItems = items.map(i => {
      const p = products.find(prod => prod.id === i.productId)!;
      return {
        productId: i.productId,
        productName: p.name,
        quantity: i.qty,
        unitCost: i.cost,
        totalCost: i.qty * i.cost
      };
    });
    
    addPurchase({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      supplier,
      items: purchaseItems,
      total: purchaseItems.reduce((acc, i) => acc + i.totalCost, 0)
    });
    setItems([]);
    setSupplier('');
    alert('Entrada de estoque realizada!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4">Nova Compra (Entrada)</h3>
        <div className="space-y-4">
          <input 
            placeholder="Fornecedor" 
            value={supplier} 
            onChange={e => setSupplier(e.target.value)}
            className="w-full p-2 border rounded" 
          />
          <div className="grid grid-cols-3 gap-2">
            <select 
              value={currentProduct} 
              onChange={e => {
                  setCurrentProduct(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if(p) setCost(p.costPrice);
              }}
              className="col-span-3 p-2 border rounded"
            >
              <option value="">Selecione o Produto</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" placeholder="Qtd" value={qty} onChange={e => setQty(Number(e.target.value))} className="p-2 border rounded" />
            <input type="number" placeholder="Custo Unit." value={cost} onChange={e => setCost(Number(e.target.value))} className="p-2 border rounded" />
            <button onClick={handleAddItem} className="bg-blue-600 text-white rounded flex items-center justify-center"><Plus/></button>
          </div>
          
          <div className="bg-slate-50 p-4 rounded h-40 overflow-auto">
            {items.map((i, idx) => {
              const p = products.find(prod => prod.id === i.productId);
              return <div key={idx} className="flex justify-between text-sm border-b py-1"><span>{p?.name}</span><span>{i.qty}x R${i.cost}</span></div>
            })}
          </div>
          <button onClick={finalizePurchase} className="w-full bg-green-600 text-white py-2 rounded font-bold">Confirmar Entrada</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4">Histórico Recente</h3>
        <div className="space-y-2">
          {purchases.slice(-5).reverse().map(p => (
            <div key={p.id} className="p-3 border rounded text-sm hover:bg-slate-50">
              <div className="flex justify-between font-bold">
                <span>{p.supplier}</span>
                <span>R$ {p.total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- CUSTOMERS COMPONENT ---
const Customers = () => {
  const { customers, addCustomer } = useStore();
  const [form, setForm] = useState({ name: '', cpf: '', phone: '', address: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({ ...form, id: Date.now().toString(), createdAt: new Date().toISOString() });
    setForm({ name: '', cpf: '', phone: '', address: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><UserPlus size={20}/> Novo Cliente</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Nome Completo" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 border rounded" />
          <input required placeholder="CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} className="w-full p-2 border rounded" />
          <input required placeholder="Telefone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-2 border rounded" />
          <input required placeholder="Endereço" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Cadastrar</button>
        </form>
      </div>
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr><th className="p-4">Nome</th><th className="p-4">CPF</th><th className="p-4">Contato</th></tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 text-slate-500">{c.cpf}</td>
                <td className="p-4 text-slate-500 flex items-center gap-2"><Phone size={14}/>{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- REPORTS COMPONENT ---
const Reports = () => {
  const { sales } = useStore();
  
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Vendas - MiniMarket Pro", 10, 10);
    let y = 20;
    sales.forEach((s, i) => {
      const line = `${new Date(s.date).toLocaleDateString()} - R$ ${s.total.toFixed(2)} (${s.paymentMethod})`;
      doc.text(line, 10, y);
      y += 10;
      if (y > 280) { doc.addPage(); y = 10; }
    });
    doc.save("relatorio_vendas.pdf");
  };

  const generateCSV = () => {
    let csv = "Data,Cliente,Total,Metodo\n";
    sales.forEach(s => {
      csv += `${new Date(s.date).toISOString()},${s.customerName || 'Anonimo'},${s.total},${s.paymentMethod}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendas.csv';
    a.click();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><FileText /> Relatórios de Vendas</h2>
        <div className="flex gap-2">
           <button onClick={generatePDF} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"><Download size={18}/> PDF</button>
           <button onClick={generateCSV} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"><Download size={18}/> CSV</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100">
              <th className="py-3 font-semibold text-slate-600">Data</th>
              <th className="py-3 font-semibold text-slate-600">Itens</th>
              <th className="py-3 font-semibold text-slate-600">Cliente</th>
              <th className="py-3 font-semibold text-slate-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sales.slice().reverse().map(s => (
              <tr key={s.id}>
                <td className="py-3 text-sm text-slate-500">{new Date(s.date).toLocaleString()}</td>
                <td className="py-3 text-sm">{s.items.length} itens</td>
                <td className="py-3 text-sm">{s.customerName || '-'}</td>
                <td className="py-3 font-bold text-slate-700">R$ {s.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Purchases, Customers, Reports };
