import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, CartItem, PaymentMethod, Customer } from '../types';
import { ShoppingCart, Trash2, Printer, CheckCircle, CreditCard, Banknote, QrCode } from 'lucide-react';

const Receipt = ({ sale, onClose }: { sale: any, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-white p-6 w-80 shadow-2xl rounded">
      <div id="receipt-print" className="text-center font-mono text-xs text-black">
        <h2 className="text-lg font-bold uppercase mb-1">MiniMarket Pro</h2>
        <p>CNPJ: 12.345.678/0001-90</p>
        <p className="mb-4">Rua das Flores, 123 - Centro</p>
        
        <div className="border-t border-b border-dashed border-black py-2 mb-2 text-left">
           <div className="flex justify-between font-bold">
             <span>ITEM</span>
             <span>TOTAL</span>
           </div>
           {sale.items.map((item: CartItem) => (
             <div key={item.id} className="flex justify-between">
               <span>{item.quantity}x {item.name}</span>
               <span>{item.subtotal.toFixed(2)}</span>
             </div>
           ))}
        </div>
        
        <div className="flex justify-between text-sm font-bold mb-1">
          <span>TOTAL</span>
          <span>R$ {sale.total.toFixed(2)}</span>
        </div>
        <div className="text-left mb-4">
          <p>Pagamento: {sale.paymentMethod}</p>
          <p>Cliente: {sale.customerName || 'Consumidor Final'}</p>
          <p>Data: {new Date(sale.date).toLocaleString()}</p>
        </div>
        
        <p className="mb-4">*** NÃO É DOCUMENTO FISCAL ***</p>
        <p className="italic">Obrigado pela preferência!</p>
      </div>

      <div className="mt-4 flex flex-col gap-2 no-print">
        <button onClick={() => window.print()} className="bg-blue-600 text-white py-2 rounded flex justify-center gap-2">
          <Printer size={16} /> Imprimir
        </button>
        <button onClick={onClose} className="bg-slate-200 text-slate-700 py-2 rounded">
          Fechar
        </button>
      </div>
    </div>
  </div>
);

const POS = () => {
  const { products, customers, addSale } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.MONEY);
  const [completedSale, setCompletedSale] = useState<any | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on input always
  useEffect(() => {
    inputRef.current?.focus();
  }, [cart]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Produto sem estoque!');
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id 
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.sellPrice } 
          : i
        );
      }
      return [...prev, { ...product, quantity: 1, subtotal: product.sellPrice }];
    });
  };

  const displayedProducts = useMemo(() => {
    if (!inputValue) return products.slice(0, 9); // Show "recent" or first 9 if no search
    const lower = inputValue.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lower) || 
      p.barcode.includes(lower)
    );
  }, [inputValue, products]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;

    // 1. Try exact barcode match first
    const exactBarcode = products.find(p => p.barcode === inputValue);
    if (exactBarcode) {
      addToCart(exactBarcode);
      setInputValue('');
      return;
    }

    // 2. Try exact name match
    const exactName = products.find(p => p.name.toLowerCase() === inputValue.toLowerCase());
    if (exactName) {
      addToCart(exactName);
      setInputValue('');
      return;
    }

    // 3. Fallback to filtered list logic
    if (displayedProducts.length === 1) {
      addToCart(displayedProducts[0]);
      setInputValue('');
    } else if (displayedProducts.length > 1) {
      // If multiple items, we do nothing and let user click one from the grid
    } else {
      alert('Produto não encontrado');
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);

  const handleFinish = () => {
    if (cart.length === 0) return;
    
    const sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      items: cart,
      total: total,
      paymentMethod: paymentMethod
    };

    addSale(sale);
    setCompletedSale(sale);
    setCart([]);
    setSelectedCustomer(null);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {completedSale && <Receipt sale={completedSale} onClose={() => setCompletedSale(null)} />}

      {/* Left: Input & Product List Simulation */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleInputSubmit} className="flex gap-4">
            <div className="relative flex-1">
              <QrCode className="absolute left-3 top-3 text-slate-400" />
              <input
                ref={inputRef}
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escaneie ou digite o nome do produto..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 rounded-lg font-semibold hover:bg-blue-700">
              Adicionar
            </button>
          </form>
        </div>

        {/* Search Results / Quick Select Grid */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">
            {inputValue ? `Resultados (${displayedProducts.length})` : 'Produtos Recentes'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayedProducts.map(p => (
              <button 
                key={p.id} 
                onClick={() => { addToCart(p); setInputValue(''); }}
                className="p-4 border border-slate-100 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left group"
              >
                <p className="font-bold text-slate-700 group-hover:text-blue-700 truncate">{p.name}</p>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-sm text-slate-500">{p.stock} un</span>
                   <span className="font-bold text-green-600">R$ {p.sellPrice.toFixed(2)}</span>
                </div>
              </button>
            ))}
            {displayedProducts.length === 0 && (
              <div className="col-span-full text-center text-slate-400 py-8">
                Nenhum produto encontrado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-96 bg-white flex flex-col rounded-xl shadow-xl border border-slate-200 h-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart size={20} /> Carrinho de Compras
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart size={48} className="mb-2 opacity-20" />
              <p>Carrinho vazio</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.quantity} x R$ {item.sellPrice.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">R$ {item.subtotal.toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
          {/* Customer Select */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Cliente</label>
            <select 
              className="w-full p-2 text-sm border border-slate-300 rounded outline-none bg-white"
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customerId = e.target.value;
                const customer = customers.find(c => c.id === customerId);
                setSelectedCustomer(customer || null);
              }}
            >
              <option value="">Consumidor Final (Sem cadastro)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: PaymentMethod.MONEY, label: 'Dinheiro', icon: Banknote },
              { id: PaymentMethod.CREDIT, label: 'Crédito', icon: CreditCard },
              { id: PaymentMethod.PIX, label: 'Pix', icon: QrCode },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`flex flex-col items-center justify-center p-2 rounded border text-xs transition
                  ${paymentMethod === m.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}
                `}
              >
                <m.icon size={16} className="mb-1" />
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-end border-t border-slate-200 pt-4">
            <span className="text-slate-600">Total a Pagar</span>
            <span className="text-3xl font-bold text-slate-800">R$ {total.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleFinish}
            disabled={cart.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg text-lg shadow-lg flex items-center justify-center gap-2 transition"
          >
            <CheckCircle size={24} />
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;