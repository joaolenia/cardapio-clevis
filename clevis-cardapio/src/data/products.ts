import { supabase } from '../services/supabase';

export interface ProductOption {
  name: string;
  price: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  categoryLinked: string;
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
  disponivel?: boolean;
  isPromo?: boolean;
  promoPrice?: number;
}

export interface Category {
  id: string;
  label: string;
}

// BUSCAR PRODUTOS DO BANCO
export const getStoredProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
  // Mapeamento dos campos do banco para o padrão CamelCase do React
  return data.map((p: any) => ({
    id: p.id,
    category: p.category,
    name: p.name,
    price: Number(p.price),
    image: p.image,
    desc: p.desc,
    allowCustomization: p.allow_customization,
    disponivel: p.disponivel,
    isPromo: p.is_promo,
    promoPrice: p.promo_price ? Number(p.promo_price) : undefined,
    isVariable: p.is_variable,
    options: p.options ? (p.options as ProductOption[]) : undefined
  }));
};

// SALVAR/ATUALIZAR PRODUTO (ADMIN)
export const saveStoredProduct = async (product: Product) => {
  const { error } = await supabase.from('products').upsert({
    id: product.id,
    category: product.category,
    name: product.name,
    price: product.price,
    image: product.image,
    desc: product.desc,
    allow_customization: product.allowCustomization,
    disponivel: product.disponivel,
    is_promo: product.isPromo,
    promo_price: product.promoPrice,
    is_variable: product.isVariable,
    options: product.options
  });
  if (error) console.error('Erro ao salvar produto:', error);
  return !error;
};

// EXCLUIR PRODUTO
export const deleteStoredProduct = async (id: number) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  return !error;
};

// BUSCAR CATEGORIAS
export const getStoredCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return [];
  return data.map((c: any) => ({ id: c.id, label: c.label }));
};

// SALVAR CATEGORIA
export const saveStoredCategory = async (category: Category) => {
  const { error } = await supabase.from('categories').upsert({
    id: category.id,
    label: category.label
  });
  return !error;
};

// EXCLUIR CATEGORIA (A exclusão em cascata deve ser ativada na foreign key do Supabase)
export const deleteStoredCategory = async (id: string) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  return !error;
};

// BUSCAR ADICIONAIS
export const getStoredAdditions = async (): Promise<CustomizationOption[]> => {
  const { data, error } = await supabase.from('additions').select('*');
  if (error) return [];
  return data.map((a: any) => ({
    id: String(a.id),
    name: a.name,
    price: Number(a.price),
    categoryLinked: a.category_linked
  }));
};

// SALVAR ADICIONAL
export const saveStoredAddition = async (addition: CustomizationOption) => {
  const { error } = await supabase.from('additions').insert({
    name: addition.name,
    price: addition.price,
    category_linked: addition.categoryLinked
  });
  return !error;
};

// EXCLUIR ADICIONAL
export const deleteStoredAddition = async (id: string) => {
  const { error } = await supabase.from('additions').delete().eq('id', id);
  return !error;
};