import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginSchema } from '../lib/validators.js';
import { getFieldMeta } from '../lib/formUtils.js';
import api from '../lib/api.js';
import { extractApiError } from '../lib/apiError.js';
import { useAuth } from '../context/AuthContext.jsx';

const meta = getFieldMeta(loginSchema);

export default function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.data.user, res.data.data.accessToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const { message, status } = extractApiError(err);
      if (status === 401) {
        form.setError('root', { message });
      } else {
        toast.error(message);
      }
    }
  });

  return { form, onSubmit, meta };
}
