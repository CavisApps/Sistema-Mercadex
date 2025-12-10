import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, User, Sale, Purchase, Customer, UserRole } from '../types';

interface StoreContextType {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  getProductByBarcode: (code: string) => Product | undefined;
  customers: Customer[];
  addCustomer: (c: Customer) => void;
  sales: Sale[];
  addSale: (s: Sale) => void;
  purchases: Purchase[];
  addPurchase: (p: Purchase) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', barcode: '789123456', name: 'Arroz 5kg', unit: 'un', costPrice: 20, margin: 25, sellPrice: 25, stock: 50, minStock: 10, category: 'Alimentos' },
  { id: '2', barcode: '789123457', name: 'Feijão 1kg', unit: 'un', costPrice: 6, margin: 33.33, sellPrice: 8, stock: 5, minStock: 15, category: 'Alimentos' },
  { id: '3', barcode: '789123458', name: 'Coca-Cola 2L', unit: 'un', costPrice: 7, margin: 42.85, sellPrice: 10, stock: 100, minStock: 20, category: 'Bebidas' },
];

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin', email: 'admin@market.com', password: '123', role: UserRole.ADMIN },
  { id: '2', name: 'Operador', email: 'op@market.com', password: '123', role: UserRole.OPERATOR },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mm_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('mm_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('mm_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('mm_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => localStorage.setItem('mm_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('mm_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('mm_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('mm_sales', JSON.stringify(sales)), [sales]);
  useEffect(() => localStorage.setItem('mm_purchases', JSON.stringify(purchases)), [purchases]);

  const login = (email: string, pass: string) => {
    const found = INITIAL_USERS.find(u => u.email === email && u.password === pass);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const addProduct = (p: Product) => setProducts(prev => [...prev, p]);
  
  const updateProduct = (p: Product) => setProducts(prev => prev.map(x => x.id === p.id ? p : x));
  
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(x => x.id !== id));

  const getProductByBarcode = (code: string) => products.find(p => p.barcode === code);

  const addCustomer = (c: Customer) => setCustomers(prev => [...prev, c]);

  const addSale = (s: Sale) => {
    setSales(prev => [...prev, s]);
    // Decrease stock
    setProducts(prev => prev.map(p => {
      const soldItem = s.items.find(i => i.id === p.id);
      if (soldItem) {
        return { ...p, stock: p.stock - soldItem.quantity };
      }
      return p;
    }));
  };

  const addPurchase = (p: Purchase) => {
    setPurchases(prev => [...prev, p]);
    // Increase stock and potentially update cost
    setProducts(prev => prev.map(prod => {
      const boughtItem = p.items.find(i => i.productId === prod.id);
      if (boughtItem) {
        // Simple Weighted Average Cost could be implemented here, but we will just keep the latest cost for simplicity or update stock only
        return { 
          ...prod, 
          stock: prod.stock + boughtItem.quantity,
          // Optional: Update cost price to latest purchase price
          // costPrice: boughtItem.unitCost 
        };
      }
      return prod;
    }));
  };

  return (
    <StoreContext.Provider value={{
      user, login, logout,
      products, addProduct, updateProduct, deleteProduct, getProductByBarcode,
      customers, addCustomer,
      sales, addSale,
      purchases, addPurchase
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
