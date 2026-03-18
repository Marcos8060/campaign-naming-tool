'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';

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
      const message = err instanceof AxiosError
        ? (err.response?.data as ApiErrorResponse)?.detail
        : undefined;
      toast.error(message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full px-3 py-2.5 border rounded-xl text-sm text-t1 placeholder:text-t3
    focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all`;

  return (
    <>
      <h2 className="text-2xl font-extrabold text-t1 mb-1">Welcome back</h2>
      <p className="text-t2 text-sm mb-7">Sign in to your Camparc workspace</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-t1 mb-1.5">Email</label>
          <input
            type="email" required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--bd)' }}
            className={inputCls}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-t1 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--bd)' }}
              className={`${inputCls} pr-10`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-t3 hover:text-t2 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-3 px-4 brand-gradient text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm shadow-violet-200 text-sm mt-2"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-t2">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand font-semibold hover:underline">
          Create one free
        </Link>
      </p>
    </>
  );
}
