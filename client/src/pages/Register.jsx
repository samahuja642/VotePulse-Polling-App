import { Link } from 'react-router-dom';
import useRegisterForm from '../hooks/useRegisterForm.js';
import Input from '../components/ui/Input.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import FormError from '../components/ui/FormError.jsx';

export default function Register() {
  const { form, onSubmit, meta } = useRegisterForm();
  const { register, formState: { errors, isSubmitting } } = form;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-10">
          <p
            className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-primary-400)' }}
          >
            VotePulse
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '2.6rem',
              lineHeight: 1,
              letterSpacing: '-0.035em',
            }}
          >
            Create your<br />account.
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Start creating and sharing polls today.
          </p>
        </div>

        <FormError message={errors.root?.message} />

        <form onSubmit={onSubmit} className="space-y-7">
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
            placeholder="you@example.com"
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
          <div className="pt-1">
            <Button type="submit" loading={isSubmitting} loadingText="Creating account…">
              Create account
            </Button>
          </div>
        </form>

        <p className="mt-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--color-primary-400)' }}
          >
            Sign in →
          </Link>
        </p>

      </div>
    </div>
  );
}
