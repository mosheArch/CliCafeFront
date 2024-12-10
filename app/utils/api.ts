import axios from 'axios';

const API_URL = 'https://api.clicafe.com/api'; // Update this to your API base URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = async (userData: {
  email: string;
  name: string;
  apellido_paterno: string;
  apellido_materno: string;
  phone: string;
  password: string;
}) => {
  try {
    const response = await api.post('/register/', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post('/login/', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const response = await api.post('/password-reset/', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await api.post('/token/refresh/', { refresh: refreshToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

// New API functions

export const getCategories = async () => {
  try {
    const response = await api.get('/categorias/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProducts = async (params?: {
  categoria?: number;
  tipo?: 'GRANO' | 'MOLIDO';
  peso?: 250 | 500 | 1000;
}) => {
  try {
    const response = await api.get('/productos/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (productData: {
  nombre: string;
  descripcion: string;
  precio: string;
  categoria_id: number;
  tipo: 'GRANO' | 'MOLIDO';
  peso: 250 | 500 | 1000;
  stock: number;
  imagen: File;
}) => {
  try {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (typeof value === 'number') {
        formData.append(key, value.toString());
      } else {
        formData.append(key, value);
      }
    });
    const response = await api.post('/productos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCart = async () => {
  try {
    const response = await api.get('/carrito/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addToCart = async (productId: number, quantity: number) => {
  try {
    const response = await api.post('/carrito/', { producto_id: productId, cantidad: quantity });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCartItem = async (itemId: number, quantity: number) => {
  try {
    const response = await api.patch(`/carrito/${itemId}/`, { cantidad: quantity });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeCartItem = async (itemId: number) => {
  try {
    await api.delete(`/carrito/${itemId}/`);
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (orderData: {
  detalles: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: string;
  }>;
  direccion_envio: {
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
    colonia: string;
    ciudad: string;
    estado: string;
    codigo_postal: string;
  };
}) => {
  try {
    const response = await api.post('/crear-orden/', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createOrderFromCart = async (shippingAddress: {
  calle: string;
  numero_exterior: string;
  numero_interior?: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
}) => {
  try {
    const response = await api.post('/crear-orden-desde-carrito/', { direccion_envio: shippingAddress });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const processPayment = async (orderId: number) => {
  try {
    const response = await api.post('/procesar-pago/', { orden_id: orderId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

