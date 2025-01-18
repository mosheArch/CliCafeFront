import axios from 'axios';

const API_URL = 'https://api.clicafe.com/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
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


export const register = async (userData: {
  email: string;
  name: string;
  apellido_paterno: string;
  apellido_materno: string;
  phone: string;
  password: string;
}) => {
  try {
    const response = await axiosInstance.post('/register/', userData);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (credentials: { email: string; password: string }) => {
  let attempts = 0;
  const maxAttempts = 3;

  const attemptLogin = async (): Promise<{ access: string; refresh: string; userProfile: UserProfile }> => {
    try {
      console.log('Attempting login...');
      const response = await axiosInstance.post('/login/', credentials);
      console.log('Login response:', response);
      const { access, refresh } = response.data;
      setAuthToken(access);
      const userProfile = await getUserProfile();
      console.log('Login successful. User profile:', userProfile);
      return { access, refresh, userProfile };
    } catch (error) {
      console.error('Login attempt failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw error;
    }
  };

  while (attempts < maxAttempts) {
    try {
      return await attemptLogin();
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error('Max login attempts reached. Login failed.');
        throw error;
      }
      console.log(`Login attempt ${attempts} failed. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }

  throw new Error('Login failed after multiple attempts');
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

export const refreshTokenRequest = async (refreshToken: string) => {
  try {
    const response = await axiosInstance.post('/token/refresh/', { refresh: refreshToken });
    console.log('Token refreshed successfully');
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

const handleTokenRefresh = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      const response = await refreshTokenRequest(refreshToken);
      setAuthToken(response.access);
      localStorage.setItem('refreshToken', response.refresh);
      return response.access;
    } catch (error) {
      console.error('Error refreshing token:', error);
      removeAuthToken();
      localStorage.removeItem('refreshToken');
      throw new Error('Session expired. Please log in again.');
    }
  } else {
    throw new Error('No refresh token available.');
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
}): Promise<{ id: number; total: number }> => {
  try {
    const response = await axiosInstance.post('/crear-orden-desde-carrito/', { direccion_envio: shippingAddress });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const newToken = await handleTokenRefresh();
      if (newToken) {
        return createOrderFromCart(shippingAddress);
      }
    }
    throw error;
  }
};

export const processPayment = async (orderId: number): Promise<{ redirect_url: string }> => {
  try {
    const response = await axiosInstance.post('/procesar-pago/', { orden_id: orderId });
    return { redirect_url: response.data.init_point };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const newToken = await handleTokenRefresh();
      if (newToken) {
        return processPayment(orderId);
      }
    }
    throw error;
  }
};

export const procesarPago = async (orderId: number): Promise<{
  preference_id: string;
  public_key: string;
  is_sandbox: boolean;
  payment_url: string;
  init_point: string;
}> => {
  try {
    console.log('Initiating payment process for order:', orderId);
    const response = await axiosInstance.post('/procesar-pago/', { orden_id: orderId });
    console.log('Payment process response:', response.data);
    if (response.data && (response.data.payment_url || response.data.init_point)) {
      return {
        ...response.data,
        payment_url: response.data.payment_url || response.data.init_point,
        init_point: response.data.init_point || response.data.payment_url
      };
    } else {
      console.error('Invalid server response:', response.data);
      throw new Error('La respuesta del servidor no contiene la información de pago necesaria');
    }
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    if (axios.isAxiosError(error)) {
      console.error('Respuesta del servidor:', error.response?.data);
      console.error('Estado de la respuesta:', error.response?.status);
      console.error('Cabeceras de la respuesta:', error.response?.headers);
    }
    throw error;
  }
};

export const registrarPagoExitoso = async (paymentData: {
  payment_id: string | null;
  status: string | null;
  collection_status: string | null;
  external_reference: string | null;
  merchant_order_id: string | null;
  preference_id: string | null;
  site_id: string | null;
  processing_mode: string | null;
  merchant_account_id: string | null;
  order_id?: string | null;
}) => {
  try {
    console.log('Registrando pago exitoso:', paymentData);

    // Validate required fields
    if (!paymentData.payment_id || !paymentData.status) {
      throw new Error('Datos de pago incompletos');
    }

    // Ensure we have either status or collection_status as approved
    if (paymentData.status !== 'approved' && paymentData.collection_status !== 'approved') {
      throw new Error('Estado de pago no válido');
    }

    const response = await axiosInstance.post('/pago-exitoso/', paymentData);
    console.log('Respuesta del registro de pago:', response.data);

    // Set payment status in sessionStorage
    sessionStorage.setItem('paymentStatus', 'success');

    return response.data;
  } catch (error) {
    console.error('Error al registrar pago exitoso:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    throw error;
  }
};

export const registrarPagoFallido = async (paymentData: any) => {
  try {
    const response = await axiosInstance.post('/pago-fallido/', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar pago fallido:', error);
    throw error;
  }
};

export const registrarPagoPendiente = async (paymentData: any) => {
  try {
    const response = await axiosInstance.post('/pago-pendiente/', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar pago pendiente:', error);
    throw error;
  }
};

export const checkServerStatus = async () => {
  try {
    const response = await axiosInstance.get('/health-check/');
    return response.data;
  } catch (error) {
    console.error('Server status check failed:', error);
    throw error;
  }
};
