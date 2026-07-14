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
  allowCustomization?: boolean; // Se permite adicionais/observações (ex: lanches, pastéis, porções)
}

// Lista de adicionais genérica para lanches e pastéis extraída dos seus cardápios
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

export const PRODUCTS: Product[] = [
  // LANCHES (Sincronizado com os preços novos da foto)
  {
    id: 1,
    category: 'lanches',
    name: 'X Super Bacon',
    price: 30.00,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, baconese, farofa de bacon, muito bacon, hambúrguer e queijo.',
    allowCustomization: true
  },
  {
    id: 2,
    category: 'lanches',
    name: 'X Colonial',
    price: 30.00,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, milho, ervilha, ovo mexido com linguiça caseira, alface, tomate, hambúrguer e queijo.',
    allowCustomization: true
  },
  {
    id: 3,
    category: 'lanches',
    name: 'X Tudo',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, presunto, picles, cebola caramelizada, cheddar, bacon, ovo, calabresa, hambúrguer, queijo, alface e tomate.',
    allowCustomization: true
  },
  {
    id: 4,
    category: 'lanches',
    name: 'X Queijos',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, requeijão cremoso, cebola grelhada, cheddar, hambúrguer e queijo.',
    allowCustomization: true
  },
  {
    id: 5,
    category: 'lanches',
    name: 'X Frango',
    price: 26.00,
    image: 'https://images.unsplash.com/photo-1627662236973-4fd8358fa206?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, presunto, cebola grelhada, peito de frango em tiras, queijo, tomate e alface.',
    allowCustomization: true
  },
  {
    id: 6,
    category: 'lanches',
    name: 'X Arriba',
    price: 29.00,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, presunto, vinagrete com pimentão, hambúrguer, queijo e doritos.',
    allowCustomization: true
  },
  {
    id: 7,
    category: 'lanches',
    name: 'X Especial',
    price: 30.00,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, presunto, champignon, cebola grelhada, cheddar, bacon, hambúrguer, queijo, alface e tomate.',
    allowCustomization: true
  },
  {
    id: 8,
    category: 'lanches',
    name: 'X Burguer',
    price: 20.00,
    image: 'https://images.unsplash.com/photo-1549611016-3a70d82b5040?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, presunto, hambúrguer e queijo.',
    allowCustomization: true
  },
  {
    id: 9,
    category: 'lanches',
    name: 'X Salada',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, tomate, alface, presunto, hambúrguer e queijo.',
    allowCustomization: true
  },
  {
    id: 10,
    category: 'lanches',
    name: 'X Bacon',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, bacon, cebola grelhada, hambúrguer, queijo, tomate e alface.',
    allowCustomization: true
  },
  {
    id: 11,
    category: 'lanches',
    name: 'X Eggs',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, presunto, cebola grelhada, ovo, hambúrguer, queijo, tomate e alface.',
    allowCustomization: true
  },
  {
    id: 12,
    category: 'lanches',
    name: 'X Calabresa',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=60',
    desc: 'Pão tostado, molho da casa, presunto, champignon, cebola grelhada, calabresa, tomate, alface, hambúrguer e queijo.',
    allowCustomization: true
  },

  // COMBOS
  {
    id: 13,
    category: 'combos',
    name: 'Combo Família',
    price: 98.00,
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&auto=format&fit=crop&q=60',
    desc: 'X Especial + X Bacon + X Salada + Batata Frita 600g.'
  },
  {
    id: 14,
    category: 'combos',
    name: 'Combo Família II',
    price: 110.00,
    image: 'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=500&auto=format&fit=crop&q=60',
    desc: 'X Tudo + X Calabresa + X Burguer + X Salada + Batata Frita 600g.'
  },

  // TÁBUAS
  {
    id: 15,
    category: 'tabuas',
    name: 'Tábua I',
    price: 110.00,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
    desc: 'Batata frita, polenta, calabresa, mandioca, alcatra acebolada e ovos de codorna. (Serve até 4 pessoas)'
  },
  {
    id: 16,
    category: 'tabuas',
    name: 'Tábua II',
    price: 90.00,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=60',
    desc: 'Frango a passarinho, tilápia, batata frita e polenta. (Serve até 4 pessoas)'
  },
  {
    id: 17,
    category: 'tabuas',
    name: 'Tábua III',
    price: 100.00,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
    desc: 'Iscas de frango, calabresa, batata frita, queijo, mandioca, alcatra acebolada e pepino em conserva. (Serve até 4 pessoas)'
  },
  {
    id: 18,
    category: 'tabuas',
    name: 'Tábua IV',
    price: 70.00,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=60',
    desc: 'Calabresa, batata frita, isca de frango, pepino em conserva e polenta. (Serve até 3 pessoas)'
  },
  {
    id: 19,
    category: 'tabuas',
    name: 'Tábua Especial',
    price: 130.00,
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop&q=60',
    desc: 'Batata frita, bacon, cheddar, tilápia, alcatra acebolada, mandioca, polenta, pepino em conserva e ovos de codorna. (Serve até 4 pessoas)'
  },

  // PASTÉIS
  { id: 20, category: 'pasteis', name: 'Pastel de Camarão', price: 22.00, image: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=500&auto=format&fit=crop&q=60', desc: 'Recheio cremoso e generoso de camarão com temperos especiais da casa.', allowCustomization: true },
  { id: 21, category: 'pasteis', name: 'Pastel de Chocolate Branco', price: 17.00, image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&auto=format&fit=crop&q=60', desc: 'Saborosa massa crocante recheada com chocolate branco derretido de alta qualidade.' },
  { id: 22, category: 'pasteis', name: 'Pastel de Tilápia', price: 20.00, image: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=500&auto=format&fit=crop&q=60', desc: 'Exclusivo pastel recheado com filé de tilápia fresca temperada.', allowCustomization: true },
  { id: 23, category: 'pasteis', name: 'Pastel de Prestígio', price: 17.00, image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&auto=format&fit=crop&q=60', desc: 'Combinação clássica de chocolate ao leite e coco ralado.' },
  { id: 24, category: 'pasteis', name: 'Pastel de 4 Queijos', price: 17.00, image: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=500&auto=format&fit=crop&q=60', desc: 'Derretimento espetacular de muçarela, provolone, parmesão e requeijão.', allowCustomization: true },
  { id: 25, category: 'pasteis', name: 'Pastel de Pizza', price: 14.00, image: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=500&auto=format&fit=crop&q=60', desc: 'Queijo derretido, presunto picado e um toque aromático de orégano.', allowCustomization: true },
  { id: 26, category: 'pasteis', name: 'Pastel de Carne', price: 17.00, image: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=500&auto=format&fit=crop&q=60', desc: 'Carne moída perfeitamente temperada, suculenta e saborosa.', allowCustomization: true },
  { id: 27, category: 'pasteis', name: 'Pastel de Frango', price: 14.00, image: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=500&auto=format&fit=crop&q=60', desc: 'Frango desfiado com tempero suave e requeijão cremoso.', allowCustomization: true },

  // CHULETA
  {
    id: 28,
    category: 'chuleta',
    name: 'Chuleta Completa',
    price: 40.00,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
    desc: 'Acompanha chuleta, batata frita, ovo, polenta, queijo, tomate e alface.'
  },
  {
    id: 29,
    category: 'chuleta',
    name: 'Chuleta com Polenta',
    price: 34.00,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
    desc: 'Generosa chuleta bovina grelhada acompanhada de polentas fritas crocantes.'
  },

  // PORÇÕES
  {
    id: 30,
    category: 'porcoes',
    name: 'Batata Cheddar e Bacon (600g)',
    price: 40.00,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60',
    desc: 'Crocante porção de batatas fritas cobertas com creme de cheddar e muito bacon.'
  },
  {
    id: 31,
    category: 'porcoes',
    name: 'Batata Frita',
    price: 23.00,
    isVariable: true,
    options: [
      { name: 'Pequena (200g)', price: 13.00 },
      { name: 'Média (400g)', price: 23.00 },
      { name: 'Grande (600g)', price: 30.00 }
    ],
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60',
    desc: 'Batatas fritas sequinhas, crocantes por fora e macias por dentro.'
  },
  {
    id: 32,
    category: 'porcoes',
    name: 'Porção de Tilápia',
    price: 50.00,
    isVariable: true,
    options: [
      { name: 'Porção (400g)', price: 50.00 },
      { name: 'Porção (600g)', price: 65.00 }
    ],
    image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500&auto=format&fit=crop&q=60',
    desc: 'Iscas de tilápia empanadas e fritas na hora.'
  },
  {
    id: 33,
    category: 'porcoes',
    name: 'Calabresa Acebolada',
    price: 27.00,
    isVariable: true,
    options: [
      { name: 'Porção (400g)', price: 27.00 },
      { name: 'Porção (600g)', price: 35.00 }
                ],
    image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500&auto=format&fit=crop&q=60',
    desc: 'Calabresa de primeira grelhada com cebola fresca.'
  },

  // BEBIDAS
  { id: 34, category: 'bebidas', name: 'Chopp Pilsen Clevi\'s (500ml)', price: 12.00, image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=500&auto=format&fit=crop&q=60', desc: 'Chopp artesanal super gelado com colarinho cremoso.' },
  { id: 35, category: 'bebidas', name: 'Refrigerante Lata', price: 6.00, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60', desc: 'Coca-cola, Guaraná Antarctica ou Fanta Laranja (lata 350ml).' },
  { id: 36, category: 'bebidas', name: 'Suco Natural de Laranja', price: 8.00, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=60', desc: 'Suco 100% puro da fruta espremida na hora geladinho.' }
];