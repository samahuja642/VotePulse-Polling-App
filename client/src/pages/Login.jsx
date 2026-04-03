import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginSchema } from '../lib/validators.js';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/ui/Input.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import FormError from '../components/ui/FormError.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.data.user, res.data.data.accessToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.error?.message || 'Something went wrong';
      if (err.response?.status === 401) {
        setError('root', { message });
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <div
        className="w-full max-w-md rounded-xl p-6 sm:p-8 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <LogIn size={22} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your VotePulse account
          </p>
        </div>

        <FormError message={errors.root?.message} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="john@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <PasswordInput
            label="Password"
            id="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button
            type="submit"
            icon={LogIn}
            loading={isSubmitting}
            loadingText="Signing in…"
          >
            Sign in
          </Button>
        </form>

        <p
          className="mt-6 text-center text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
