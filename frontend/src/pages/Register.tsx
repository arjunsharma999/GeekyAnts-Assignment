import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { CreateUserRequest } from '../types';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const initialForm: CreateUserRequest = {
  email: '',
  name: '',
  role: 'engineer',
  password: '',
  skills: [],
  seniority: 'junior',
  maxCapacity: 100,
  department: '',
};

const Register: React.FC = () => {
  const [form, setForm] = useState<CreateUserRequest>(initialForm);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, skills: e.target.value.split(',').map(s => s.trim()) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await authAPI.register(form);
      setSuccess('User registered successfully!');
      setForm(initialForm);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register user');
    }
  };

  return (
    <>
    <Navigation />
    
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl mb-4">Register New User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Email" className="w-full border px-3 py-2 rounded" />
        <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="w-full border px-3 py-2 rounded" />
        <select name="role" value={form.role} onChange={handleChange} className="w-full border px-3 py-2 rounded">
          <option value="engineer">Engineer</option>
          <option value="manager">Manager</option>
        </select>
        <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Password" className="w-full border px-3 py-2 rounded" />
        <input type="text" name="skills" value={(form.skills || []).join(', ')} onChange={handleSkillsChange} placeholder="Skills (comma separated)" className="w-full border px-3 py-2 rounded" />
        <select name="seniority" value={form.seniority} onChange={handleChange} className="w-full border px-3 py-2 rounded">
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>
        <select name="maxCapacity" value={form.maxCapacity} onChange={handleChange} className="w-full border px-3 py-2 rounded">
          <option value={100}>Full-time (100%)</option>
          <option value={50}>Part-time (50%)</option>
        </select>
        <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="Department" className="w-full border px-3 py-2 rounded" />
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-indigo-700">Register</button>
      </form>
    </div>
    </>
  );
};

export default Register; 