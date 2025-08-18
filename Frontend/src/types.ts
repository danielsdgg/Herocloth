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
}

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image1: string; // Added image1
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  role: string;
}