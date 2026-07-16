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

export interface FlavorOption {
  id: string;
  name: string;
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

export interface StoreConfig {
  id: number;
  aberto: boolean;
  entrega: number;
}

// BUSCAR PRODUTOS DO BANCO
export const getStoredProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
  return data.map((p: any) => ({
    id: p.id,
    category: p.category,
    name: p.name,
    price: Number(p.price),
    image: p.image,
    desc: p.desc || '',
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

// EXCLUIR PRODUTO E SUA FOTO NO STORAGE
export const deleteStoredProduct = async (id: number) => {
  try {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image')
      .eq('id', id)
      .single();

    if (fetchError) console.error('Erro ao buscar imagem do produto para exclusão:', fetchError);

    if (product && product.image && product.image.includes('product-images')) {
      const urlParts = product.image.split('/product-images/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('product-images').remove([filePath]);
      }
    }

    const { error: deleteError } = await supabase.from('products').delete().eq('id', id);
    return !deleteError;
  } catch (err) {
    console.error('Erro inesperado ao deletar produto:', err);
    return false;
  }
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
  if (error) console.error('ERRO REAL DO SUPABASE AO SALVAR CATEGORIA:', error);
  return !error;
};

// EXCLUIR CATEGORIA
export const deleteStoredCategory = async (id: string) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) console.error('ERRO REAL DO SUPABASE AO EXCLUIR CATEGORIA:', error);
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
  if (error) console.error('ERRO REAL DO SUPABASE AO SALVAR ADICIONAL:', error);
  return !error;
};

// EXCLUIR ADICIONAL
export const deleteStoredAddition = async (id: string) => {
  const { error } = await supabase.from('additions').delete().eq('id', id);
  return !error;
};

// BUSCAR SABORES
export const getStoredFlavors = async (): Promise<FlavorOption[]> => {
  const { data, error } = await supabase.from('flavors').select('*');
  if (error) return [];
  return data.map((f: any) => ({
    id: String(f.id),
    name: f.name,
    categoryLinked: f.category_linked
  }));
};

export const saveStoredFlavor = async (flavor: Omit<FlavorOption, 'id'>) => {
  const { error } = await supabase.from('flavors').insert({
    name: flavor.name,
    category_linked: flavor.categoryLinked
  });
  if (error) console.error('ERRO REAL DO SUPABASE AO SALVAR SABOR:', error);
  return !error;
};

export const deleteStoredFlavor = async (id: string) => {
  const { error } = await supabase.from('flavors').delete().eq('id', id);
  return !error;
};

// ENVIAR IMAGEM PARA O STORAGE
export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) {
      console.error('Erro ao enviar imagem para o Supabase Storage:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Erro inesperado durante o upload da imagem:', err);
    return null;
  }
};

export const authenticateManager = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('manager_auth')
      .select('*')
      .eq('username', usernameInput.trim())
      .eq('password', passwordInput.trim())
      .limit(1); 
    if (error || !data || data.length === 0) {
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao processar autenticacao:', err);
    return false;
  }
};

// --- CONFIGURAÇÃO DA LOJA (STATUS E TEMPO) ---
export const getStoreConfiguration = async (): Promise<StoreConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('configuration')
      .select('*')
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Erro ao buscar configuração da loja:', error);
      return null;
    }
    
    if (!data) {
      return { id: 1, aberto: true, entrega: 45 };
    }
    
    return { id: data.id, aberto: data.aberto, entrega: Number(data.entrega) };
  } catch (err) {
    console.error('Erro inesperado ao buscar configuração:', err);
    return null;
  }
};

export const saveStoreConfiguration = async (config: StoreConfig) => {
  const { error } = await supabase.from('configuration').upsert({
    id: config.id,
    aberto: config.aberto,
    entrega: config.entrega
  });
  if (error) {
    console.error('Erro ao salvar configuração da loja:', error);
    return false;
  }
  return true;
};