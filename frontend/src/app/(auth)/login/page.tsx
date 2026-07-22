'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { ApiError } from '@/lib/api/request';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : undefined;
      toast.error(message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `rounded-xl py-3 text-[#0f1c3f] placeholder:text-[#9ca3af]
    focus:border-brand focus:ring-brand/20 transition-all`;

  return (
    <>
      <h2 className="text-3xl font-extrabold text-[#0f1c3f] mb-1.5">Welcome back</h2>
      <p className="text-[#6b7280] text-base mb-8">Sign in to your Camparc workspace</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">Email</label>
          <Input
            type="email" required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ backgroundColor: '#f5f8ff', borderColor: '#dde5f4' }}
            className={inputCls}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-[#6b7280] uppercase tracking-wider">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPw ? 'text' : 'password'} required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ backgroundColor: '#f5f8ff', borderColor: '#dde5f4' }}
              className={`${inputCls} pr-10`}
              placeholder="••••••••"
            />
            <Button
              type="button"
              variant="text"
              size="icon"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <Button
          type="submit"
          variant="text"
          loading={loading}
          className="w-full py-3.5 px-4 primary-gradient text-white font-bold rounded-xl hover:opacity-90 shadow-sm shadow-primary/20 text-sm mt-3"
        >
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6b7280]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Create one free
        </Link>
      </p>
    </>
  );
}
