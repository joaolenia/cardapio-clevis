export interface ProductOption {
  name: string;
  price: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  categoryLinked: string; // Nova propriedade para vincular (ex: 'lanches', 'pizzas')
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
  customizationType?: string;
  disponivel?: boolean;
  isPromo?: boolean;      // Nova propriedade para promoção
  promoPrice?: number;   // Novo preço promocional
}

export interface Category {
  id: string;
  label: string;
}

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
  }
];

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

// Novas funções para ler e salvar os adicionais customizados dinâmicos
export const getStoredAdditions = (): CustomizationOption[] => {
  const data = localStorage.getItem('clevis_dynamic_additions');
  if (!data) {
    const defaultAdditions: CustomizationOption[] = [
      { id: 'add-1', name: 'Hambúrguer extra', price: 7.00, categoryLinked: 'lanches' },
      { id: 'add-2', name: 'Borda de Catupiry', price: 8.00, categoryLinked: 'pizzas' }
    ];
    localStorage.setItem('clevis_dynamic_additions', JSON.stringify(defaultAdditions));
    return defaultAdditions;
  }
  return JSON.parse(data);
};

export const saveStoredAdditions = (additions: CustomizationOption[]) => {
  localStorage.setItem('clevis_dynamic_additions', JSON.stringify(additions));
};