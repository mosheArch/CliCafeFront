import React, { useState, useEffect } from 'react';
import { register } from '../utils/api';

interface RegisterFormProps {
  onClose: () => void;
  onRegisterSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onClose, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    apellido_paterno: '',
    apellido_materno: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // This effect will run once when the component mounts
    // It ensures that the CSRF token cookie is set
    fetch('https://api.clicafe.com/api/csrf-cookie/', {
      method: 'GET',
      credentials: 'include',
    }).then(() => {
      console.log('CSRF cookie set');
    }).catch((error) => {
      console.error('Error setting CSRF cookie:', error);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      onRegisterSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al registrar. Por favor, intente nuevamente.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-green-400 mb-6">Registro de Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-green-400 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-green-400 border border-green-500 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-green-400 mb-1">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-green-400 border border-green-500 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="apellido_paterno" className="block text-green-400 mb-1">Apellido Paterno</label>
            <input
              type="text"
              id="apellido_paterno"
              name="apellido_paterno"
              value={formData.apellido_paterno}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-green-400 border border-green-500 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="apellido_materno" className="block text-green-400 mb-1">Apellido Materno</label>
            <input
              type="text"
              id="apellido_materno"
              name="apellido_materno"
              value={formData.apellido_materno}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-green-400 border border-green-500 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-green-400 mb-1">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-green-400 border border-green-500 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-green-400 mb-1">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-green-400 border border-green-500 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-green-400 mb-1">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-green-400 border border-green-500 rounded px-3 py-2"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Registrar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;