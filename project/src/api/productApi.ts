import { Product } from '../types';

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('http://localhost:5031/api/product');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const products: Product[] = await response.json();
    console.log('API response:', products);
    return products;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw error;
  }
};