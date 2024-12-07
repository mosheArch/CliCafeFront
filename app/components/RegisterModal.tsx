import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { register } from '../utils/api'

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    apellido_paterno: '',
    apellido_materno: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(formData);
      onSuccess(formData.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-green-400">
        <DialogHeader>
          <DialogTitle>Register for CLIcafe</DialogTitle>
          <DialogDescription>
            Enter your details to create an account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required onChange={handleChange} className="bg-gray-700 text-green-400 border-green-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required onChange={handleChange} className="bg-gray-700 text-green-400 border-green-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
            <Input id="apellido_paterno" name="apellido_paterno" required onChange={handleChange} className="bg-gray-700 text-green-400 border-green-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido_materno">Apellido Materno</Label>
            <Input id="apellido_materno" name="apellido_materno" required onChange={handleChange} className="bg-gray-700 text-green-400 border-green-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" required onChange={handleChange} className="bg-gray-700 text-green-400 border-green-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required onChange={handleChange} className="bg-gray-700 text-green-400 border-green-500" />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" className="w-full bg-green-500 text-black hover:bg-green-600">Register</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;

