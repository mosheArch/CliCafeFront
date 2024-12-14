import axios from 'axios';

const API_URL = 'https://api.clicafe.com/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  apellido_paterno: string;
  apellido_materno: string;
  phone: string | null;
  full_name: string;
}

const getCSRFToken = (): string | null => {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
};

export const register = async (userData: {
  email: string;
  name: string;
  apellido_paterno: string;
  apellido_materno: string;
  phone: string;
  password: string;
}) => {
  try {
    const csrfToken = getCSRFToken();
    const response = await axiosInstance.post('/register/', userData, {
      headers: {
        'X-CSRFToken': csrfToken || '',
      },
    });
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await axiosInstance.post('/login/', credentials);
    const { access, refresh } = response.data;
    setAuthToken(access);
    const userProfile = await getUserProfile();
    console.log('Login successful. User profile:', userProfile);
    return { access, refresh, userProfile };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.get('/user/profile/');
    console.log('User profile fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post('/password-reset/', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await axiosInstance.post('/token/refresh/', { refresh: refreshToken });
    console.log('Token refreshed successfully');
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const setAuthToken = (token: string) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set:', token);
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    console.log('Auth token removed');
  }
};

export const removeAuthToken = () => {
  delete axiosInstance.defaults.headers.common['Authorization'];
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching categories...');
    const response = await axiosInstance.get('/categorias/');
    console.log('Categories fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching categories:', error.response?.status, error.response?.data);
      console.error('Request config:', error.config);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};

export const getProducts = async (params?: {
  categoria?: number;
  tipo?: 'GRANO' | 'MOLIDO';
  peso?: 250 | 500 | 1000;
}) => {
  try {
    console.log('Fetching products...');
    const response = await axiosInstance.get('/productos/', { params });
    console.log('Products fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching products:', error.response?.status, error.response?.data);
      console.error('Request config:', error.config);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};

export const getProductDetails = async (productId: number) => {
  try {
    console.log(`Fetching product details for ID: ${productId}`);
    const response = await axiosInstance.get(`/productos/${productId}/`);
    console.log('Product details fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product details for ID ${productId}:`, error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request config:', error.config);
    }
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
    const response = await axiosInstance.post('/productos/', formData, {
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
    const response = await axiosInstance.get('/carrito/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addToCart = async (productId: number, quantity: number) => {
  try {
    const response = await axiosInstance.post('/carrito/', { producto_id: productId, cantidad: quantity });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCartItem = async (itemId: number, quantity: number) => {
  try {
    const response = await axiosInstance.patch(`/carrito/${itemId}/`, { cantidad: quantity });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeCartItem = async (itemId: number) => {
  try {
    await axiosInstance.delete(`/carrito/${itemId}/`);
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
    const response = await axiosInstance.post('/crear-orden/', orderData);
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
    const response = await axiosInstance.post('/crear-orden-desde-carrito/', { direccion_envio: shippingAddress });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const processPayment = async (orderId: number) => {
  try {
    const response = await axiosInstance.post('/procesar-pago/', { orden_id: orderId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

