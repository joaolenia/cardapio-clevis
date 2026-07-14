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
  customizationType?: 'lanches' | 'pizzas'; // Define qual grupo de adicionais carregar
}

export const ADICIONAIS_LANCHES: CustomizationOption[] = [
  { id: 'add-hamburguer', name: 'Hambúrguer extra', price: 7.00 },
  { id: 'add-frango', name: 'Frango em tiras', price: 5.00 },
  { id: 'add-bacon', name: 'Bacon extra', price: 3.00 },
  { id: 'add-calabresa', name: 'Calabresa extra', price: 3.00 },
  { id: 'add-linguica', name: 'Linguiça extra', price: 3.00 },
  { id: 'add-ovo', name: 'Ovo extra', price: 2.00 },
  { id: 'add-cheddar', name: 'Cheddar extra', price: 2.00 },
  { id: 'add-picles', name: 'Picles extra', price: 2.00 }
];

export const ADICIONAIS_PIZZAS: CustomizationOption[] = [
  { id: 'edge-catupiry', name: 'Borda de Catupiry', price: 8.00 },
  { id: 'edge-cheddar', name: 'Borda de Cheddar', price: 8.00 },
  { id: 'add-cheese', name: 'Queijo Extra', price: 6.00 },
  { id: 'add-oregano', name: 'Orégano Extra', price: 0.00 }
];

export const PRODUCTS: Product[] = [
  // LANCHES
  {
    id: 1,
    category: 'lanches',
    name: 'X Super Bacon',
    price: 30.00,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, baconese, farofa de bacon, muito bacon, hambúrguer e queijo.',
    allowCustomization: true,
    customizationType: 'lanches'
  },
  // PIZZAS
  {
    id: 40,
    category: 'pizzas',
    name: 'Pizza Calabresa',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    desc: 'Molho de tomate caseiro, muçarela artesanal, calabresa fatiada e cebola roxa.',
    allowCustomization: true,
    customizationType: 'pizzas',    isVariable: true,
    options: [
      { name: 'Pequena (6 fatias)', price: 80.00 },
      { name: 'Média (8 fatias)', price: 100.00 },
      { name: 'Grande (12 fatias)', price: 120.00 }
    ] 
  },
  {
    id: 41,
    category: 'pizzas',
    name: 'Pizza 4 Queijos',
    price: 48.00,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60',
    desc: 'Molho de tomate, muçarela, provolone, parmesão ralado e gorgonzola cremoso.',
    allowCustomization: true,
    customizationType: 'pizzas',
    isVariable: true,
    options: [
      { name: 'Pequena (6 fatias)', price: 80.00 },
      { name: 'Média (8 fatias)', price: 100.00 },
      { name: 'Grande (12 fatias)', price: 120.00 }
    ] 
  }
  // Os demais itens do seu cardápio continuam aqui abaixo...
];