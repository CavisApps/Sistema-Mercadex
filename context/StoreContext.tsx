import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, User, Sale, Purchase, Customer, UserRole, Supplier, CashMovement } from '../types';

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
  suppliers: Supplier[];
  addSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
  sales: Sale[];
  addSale: (s: Sale) => void;
  purchases: Purchase[];
  addPurchase: (p: Purchase) => void;
  cashMovements: CashMovement[];
  addCashMovement: (m: CashMovement) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', barcode: '789123456', name: 'Arroz 5kg', unit: 'un', costPrice: 20, margin: 25, sellPrice: 25, stock: 50, minStock: 10, category: 'Alimentos' },
  { id: '2', barcode: '789123457', name: 'Feijão 1kg', unit: 'un', costPrice: 6, margin: 33.33, sellPrice: 8, stock: 5, minStock: 15, category: 'Alimentos' },
  { id: '3', barcode: '789123458', name: 'Coca-Cola 2L', unit: 'un', costPrice: 7, margin: 42.85, sellPrice: 10, stock: 100, minStock: 20, category: 'Bebidas' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'João Silva', cpf: '123.456.789-00', phone: '(11) 99999-9999', address: 'Rua das Flores, 123', createdAt: new Date().toISOString() },
  { id: '2', name: 'Maria Oliveira', cpf: '987.654.321-00', phone: '(11) 88888-8888', address: 'Av. Paulista, 1000', createdAt: new Date().toISOString() },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Distribuidora ABC', cnpj: '11.111.111/0001-11', contact: 'Carlos', phone: '(11) 3333-3333' },
  { id: '2', name: 'Bebidas X', cnpj: '22.222.222/0001-22', contact: 'Fernanda', phone: '(11) 4444-4444' },
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
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('mm_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('mm_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('mm_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [cashMovements, setCashMovements] = useState<CashMovement[]>(() => {
    const saved = localStorage.getItem('mm_cash_movements');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => localStorage.setItem('mm_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('mm_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('mm_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('mm_suppliers', JSON.stringify(suppliers)), [suppliers]);
  useEffect(() => localStorage.setItem('mm_sales', JSON.stringify(sales)), [sales]);
  useEffect(() => localStorage.setItem('mm_purchases', JSON.stringify(purchases)), [purchases]);
  useEffect(() => localStorage.setItem('mm_cash_movements', JSON.stringify(cashMovements)), [cashMovements]);

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

  const addSupplier = (s: Supplier) => setSuppliers(prev => [...prev, s]);

  const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));

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
    // Increase stock
    setProducts(prev => prev.map(prod => {
      const boughtItem = p.items.find(i => i.productId === prod.id);
      if (boughtItem) {
        return { 
          ...prod, 
          stock: prod.stock + boughtItem.quantity,
        };
      }
      return prod;
    }));
  };

  const addCashMovement = (m: CashMovement) => setCashMovements(prev => [...prev, m]);

  return (
    <StoreContext.Provider value={{
      user, login, logout,
      products, addProduct, updateProduct, deleteProduct, getProductByBarcode,
      customers, addCustomer,
      suppliers, addSupplier, deleteSupplier,
      sales, addSale,
      purchases, addPurchase,
      cashMovements, addCashMovement
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