import { Link } from 'react-router-dom';
import useLoginForm from '../hooks/useLoginForm.js';
import Input from '../components/ui/Input.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import FormError from '../components/ui/FormError.jsx';

export default function Login() {
  const { form, onSubmit, meta } = useLoginForm();
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
            Welcome<br />back.
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue to your account.
          </p>
        </div>

        <FormError message={errors.root?.message} />

        <form onSubmit={onSubmit} className="space-y-7">
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
            placeholder="Your password"
            autoComplete="current-password"
            required={meta.password}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="pt-1">
            <Button type="submit" loading={isSubmitting} loadingText="Signing in…">
              Sign in
            </Button>
          </div>
        </form>

        <p className="mt-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          No account?{' '}
          <Link
            to="/register"
            className="font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--color-primary-400)' }}
          >
            Create one →
          </Link>
        </p>

      </div>
    </div>
  );
}
