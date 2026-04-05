import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerSchema, registerBaseSchema } from '../lib/validators.js';
import { getFieldMeta } from '../lib/formUtils.js';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const meta = getFieldMeta(registerBaseSchema);

export default function useRegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = form.handleSubmit(async ({ confirmPassword: _, ...data }) => {
    try {
      const res = await api.post('/auth/register', data);
      login(res.data.data.user, res.data.data.accessToken);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.error?.message || 'Something went wrong';
      if (err.response?.status === 409) {
        form.setError('root', { message });
      } else {
        toast.error(message);
      }
    }
  });

  return { form, onSubmit, meta };
}
