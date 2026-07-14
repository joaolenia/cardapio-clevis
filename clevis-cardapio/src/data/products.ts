export interface ProductOption {
  name: string;
  price: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: number;
  category: string;
  name: string;
  price: number;
  image: string;
  desc: string;
  isVariable?: boolean;
  options?: ProductOption[];
  allowCustomization?: boolean;
  customizationType?: 'lanches' | 'pizzas';
  disponivel?: boolean; // Nova flag para o dono pausar produtos
}

export interface Category {
  id: string;
  label: string;
}

export const ADICIONAIS_LANCHES: CustomizationOption[] = [
  { id: 'add-hamburguer', name: 'Hambúrguer extra', price: 7.00 },
  { id: 'add-frango', name: 'Frango em tiras', price: 5.00 },
  { id: 'add-bacon', name: 'Bacon extra', price: 3.00 },
  { id: 'add-calabresa', name: 'Calabresa extra', price: 3.00 },
  { id: 'add-ovo', name: 'Ovo extra', price: 2.00 },
  { id: 'add-cheddar', name: 'Cheddar extra', price: 2.00 }
];

export const ADICIONAIS_PIZZAS: CustomizationOption[] = [
  { id: 'edge-catupiry', name: 'Borda de Catupiry', price: 8.00 },
  { id: 'edge-cheddar', name: 'Borda de Cheddar', price: 8.00 },
  { id: 'add-cheese', name: 'Queijo Extra', price: 6.00 }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'lanches', label: '🍔 Lanches' },
  { id: 'combos', label: '📦 Combos' },
  { id: 'tabuas', label: '🪵 Tábuas' },
  { id: 'pasteis', label: '🥟 Pastéis' },
  { id: 'porcoes', label: '🍟 Porções' },
  { id: 'bebidas', label: '🥤 Bebidas' },
  { id: 'pizzas', label: '🍕 Pizzas' }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    category: 'lanches',
    name: 'X Super Bacon',
    price: 30.00,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, baconese, farofa de bacon, muito bacon, hambúrguer e queijo.',
    allowCustomization: true,
    customizationType: 'lanches',
    disponivel: true
  },
  {
    id: 40,
    category: 'pizzas',
    name: 'Pizza Calabresa',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    desc: 'Molho de tomate caseiro, muçarela artesanal, calabresa fatiada e cebola roxa.',
    allowCustomization: true,
    customizationType: 'pizzas',
    disponivel: true
  }
];

// Funções Helpers auxiliares para ler e salvar no localStorage
export const getStoredProducts = (): Product[] => {
  const data = localStorage.getItem('clevis_products');
  if (!data) {
    localStorage.setItem('clevis_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(data);
};

export const saveStoredProducts = (products: Product[]) => {
  localStorage.setItem('clevis_products', JSON.stringify(products));
};

export const getStoredCategories = (): Category[] => {
  const data = localStorage.getItem('clevis_categories');
  if (!data) {
    localStorage.setItem('clevis_categories', JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  return JSON.parse(data);
};

export const saveStoredCategories = (categories: Category[]) => {
  localStorage.setItem('clevis_categories', JSON.stringify(categories));
};