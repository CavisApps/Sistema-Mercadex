import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Purchase, Customer } from '../types';
import { Plus, Download, FileText, UserPlus, Phone, Calendar } from 'lucide-react';
import { jsPDF } from "jspdf"; 

// --- PURCHASES COMPONENT ---
const Purchases = () => {
  const { products, addPurchase, purchases, suppliers } = useStore();
  const [supplierId, setSupplierId] = useState('');
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
    if (items.length === 0 || !supplierId) return;
    
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

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
      supplier: supplier.name, // Keeping name for history display simplicity
      supplierId: supplier.id,
      items: purchaseItems,
      total: purchaseItems.reduce((acc, i) => acc + i.totalCost, 0)
    });
    setItems([]);
    setSupplierId('');
    alert('Entrada de estoque realizada!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4">Nova Compra (Entrada)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor</label>
            <select 
              value={supplierId} 
              onChange={e => setSupplierId(e.target.value)}
              className="w-full p-2 border rounded border-slate-300"
            >
              <option value="">Selecione o Fornecedor...</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name} - {s.cnpj}</option>
              ))}
            </select>
            {suppliers.length === 0 && <p className="text-xs text-red-500 mt-1">Nenhum fornecedor cadastrado.</p>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select 
              value={currentProduct} 
              onChange={e => {
                  setCurrentProduct(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if(p) setCost(p.costPrice);
              }}
              className="col-span-3 p-2 border rounded border-slate-300"
            >
              <option value="">Selecione o Produto</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" placeholder="Qtd" value={qty} onChange={e => setQty(Number(e.target.value))} className="p-2 border rounded border-slate-300" />
            <input type="number" placeholder="Custo Unit." value={cost} onChange={e => setCost(Number(e.target.value))} className="p-2 border rounded border-slate-300" />
            <button onClick={handleAddItem} className="bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700"><Plus/></button>
          </div>
          
          <div className="bg-slate-50 p-4 rounded h-40 overflow-auto border border-slate-100">
            {items.length === 0 && <p className="text-center text-sm text-slate-400 mt-10">Nenhum item adicionado.</p>}
            {items.map((i, idx) => {
              const p = products.find(prod => prod.id === i.productId);
              return <div key={idx} className="flex justify-between text-sm border-b border-slate-200 py-2"><span>{p?.name}</span><span>{i.qty}x R${i.cost}</span></div>
            })}
          </div>
          <button 
            onClick={finalizePurchase} 
            disabled={!supplierId || items.length === 0}
            className="w-full bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2 rounded font-bold hover:bg-green-700 transition"
          >
            Confirmar Entrada
          </button>
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
              <p className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString()} - {p.items.length} itens</p>
            </div>
          ))}
          {purchases.length === 0 && <p className="text-slate-400 text-center py-10">Nenhuma compra registrada.</p>}
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = new Date(s.date).getTime();
      const start = startDate ? new Date(startDate).setHours(0,0,0,0) : 0;
      const end = endDate ? new Date(endDate).setHours(23,59,59,999) : Infinity;
      return saleDate >= start && saleDate <= end;
    });
  }, [sales, startDate, endDate]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Vendas - Mercado Fácil", 10, 10);
    
    let info = "Período: ";
    if (startDate && endDate) info += `${new Date(startDate).toLocaleDateString()} a ${new Date(endDate).toLocaleDateString()}`;
    else if (startDate) info += `A partir de ${new Date(startDate).toLocaleDateString()}`;
    else info += "Todo o histórico";
    doc.setFontSize(10);
    doc.text(info, 10, 16);
    doc.setFontSize(12);

    let y = 25;
    filteredSales.forEach((s, i) => {
      const line = `${new Date(s.date).toLocaleDateString()} - R$ ${s.total.toFixed(2)} (${s.paymentMethod})`;
      doc.text(line, 10, y);
      y += 10;
      if (y > 280) { doc.addPage(); y = 10; }
    });
    
    const total = filteredSales.reduce((acc, s) => acc + s.total, 0);
    doc.text(`Total do Período: R$ ${total.toFixed(2)}`, 10, y + 5);

    doc.save("relatorio_vendas.pdf");
  };

  const generateCSV = () => {
    let csv = "Data,Cliente,Total,Metodo\n";
    filteredSales.forEach(s => {
      csv += `${new Date(s.date).toISOString()},${s.customerName || 'Anonimo'},${s.total},${s.paymentMethod}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendas.csv';
    a.click();
  };

  const totalFiltered = filteredSales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><FileText /> Relatórios de Vendas</h2>
        <div className="flex gap-2">
           <button onClick={generatePDF} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"><Download size={18}/> PDF</button>
           <button onClick={generateCSV} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"><Download size={18}/> CSV</button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
         <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data Inicial</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data Final</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm text-slate-500">Total no período</p>
              <p className="text-xl font-bold text-slate-800">R$ {totalFiltered.toFixed(2)}</p>
            </div>
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
            {filteredSales.length === 0 ? (
               <tr><td colSpan={4} className="py-8 text-center text-slate-400">Nenhuma venda encontrada no período.</td></tr>
            ) : (
              filteredSales.slice().reverse().map(s => (
                <tr key={s.id}>
                  <td className="py-3 text-sm text-slate-500">{new Date(s.date).toLocaleString()}</td>
                  <td className="py-3 text-sm">{s.items.length} itens</td>
                  <td className="py-3 text-sm">{s.customerName || '-'}</td>
                  <td className="py-3 font-bold text-slate-700">R$ {s.total.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Purchases, Customers, Reports };