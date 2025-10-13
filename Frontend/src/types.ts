export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image1: string;
  image2: string;
  image3: string;
  category: string;
}

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
  stock?: number; // Add stock as optional or required based on backend
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  role: string;
}