// types.ts
export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
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
  image1: string;
  stock?: number; // Optional, in case backend includes it
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  role: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string | null;
  };
}