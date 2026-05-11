import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo-sistematize.png"
            alt="Sistematize"
            style={{ height: '36px', width: 'auto' }}
            draggable={false}
            className="mb-3"
          />
          <span className="text-[11px] font-bold text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2.5 py-1 rounded-md uppercase tracking-wider">
            Admin
          </span>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
