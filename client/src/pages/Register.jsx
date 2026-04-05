import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import useRegisterForm from '../hooks/useRegisterForm.js';
import Input from '../components/ui/Input.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import FormError from '../components/ui/FormError.jsx';

export default function Register() {
  const { form, onSubmit, meta } = useRegisterForm();
  const { register, formState: { errors, isSubmitting } } = form;

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
            <UserPlus size={22} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Join VotePulse and start creating polls
          </p>
        </div>

        <FormError message={errors.root?.message} />

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Username"
            id="username"
            placeholder="johndoe"
            autoComplete="username"
            required={meta.username}
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="john@example.com"
            autoComplete="email"
            required={meta.email}
            error={errors.email?.message}
            {...register('email')}
          />
          <PasswordInput
            label="Password"
            id="password"
            placeholder="Min 8 characters"
            autoComplete="new-password"
            required={meta.password}
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordInput
            label="Confirm Password"
            id="confirmPassword"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required={meta.confirmPassword}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button
            type="submit"
            icon={UserPlus}
            loading={isSubmitting}
            loadingText="Creating account…"
          >
            Create account
          </Button>
        </form>

        <p
          className="mt-6 text-center text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
