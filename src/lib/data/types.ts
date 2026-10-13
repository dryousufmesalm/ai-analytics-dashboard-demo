export type Region = "North America" | "Europe" | "APAC" | "LATAM";
export type Channel = "web" | "mobile" | "marketplace";
export type Plan = "free" | "pro" | "enterprise";
export type ProductCategory =
  | "Analytics"
  | "Automation"
  | "Commerce"
  | "Support";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unitPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  plan: Plan;
  region: Region;
  signupDate: string;
}

export interface Order {
  id: string;
  orderDate: string;
  customerId: string;
  productId: string;
  quantity: number;
  revenue: number;
  region: Region;
  channel: Channel;
  category: ProductCategory;
}

export interface Dataset {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  generatedAt: string;
}
