export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // In a real app, never store plain text
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  unit: string; // un, kg, lt
  costPrice: number;
  margin: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  category: string;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export enum PaymentMethod {
  MONEY = 'DINHEIRO',
  CREDIT = 'CARTAO_CREDITO',
  DEBIT = 'CARTAO_DEBITO',
  PIX = 'PIX'
}

export interface Sale {
  id: string;
  date: string;
  customerId?: string;
  customerName?: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
}

export interface Purchase {
  id: string;
  date: string;
  supplier: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  total: number;
}
