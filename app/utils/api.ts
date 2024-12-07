import axios from 'axios';

const API_URL = 'http://192.168.68.136:8000/api'; // Update this to your API base URL

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
    const response = await api.post('/register/', {
      email: userData.email,
      name: userData.name,
      apellido_paterno: userData.apellido_paterno,
      apellido_materno: userData.apellido_materno,
      phone: userData.phone,
      password: userData.password,
    });
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error de registro:', error.response.data);
      throw new Error(`Error de registro: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error('Error desconocido:', error);
      throw new Error('Error desconocido durante el registro');
    }
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

