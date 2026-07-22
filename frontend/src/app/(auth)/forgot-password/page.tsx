'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MailCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { usePost } from '@/lib/hooks/api';
import { ApiError } from '@/lib/api/request';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const forgotPasswordMutation = usePost<{ message: string }, { email: string }>({
    url: '/auth/forgot-password',
  });

  const inputCls = `rounded-xl py-3 text-[#0f1c3f] placeholder:text-[#9ca3af]
    focus:border-brand focus:ring-brand/20 transition-all`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // The backend responds identically whether or not the email is
      // registered — that's what makes this screen safe to show as success.
      // A thrown error here means the request itself failed (backend down,
      // 500, network issue) — that's a real problem and should surface,
      // not be swallowed and shown as if it worked.
      await forgotPasswordMutation.mutateAsync({ email });
      setSubmitted(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : undefined;
      toast.error(message || 'Could not reach the server. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <MailCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0f1c3f] mb-2">Check your email</h2>
        <p className="text-[#6b7280] text-sm leading-relaxed mb-8">
          If an account exists for <span className="font-semibold text-[#0f1c3f]">{email}</span>,
          we&apos;ve sent a link to reset your password. It expires in 1 hour.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-extrabold text-[#0f1c3f] mb-1.5">Forgot password?</h2>
      <p className="text-[#6b7280] text-base mb-8">
        Enter the email on your account and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">Email</label>
          <Input
            type="email" required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ backgroundColor: '#f5f8ff', borderColor: '#dde5f4' }}
            className={inputCls}
            placeholder="you@company.com"
          />
        </div>

        <Button
          type="submit"
          variant="text"
          loading={forgotPasswordMutation.isPending}
          className="w-full py-3.5 px-4 primary-gradient text-white font-bold rounded-xl hover:opacity-90 shadow-sm shadow-primary/20 text-sm mt-3"
        >
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6b7280]">
        <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </p>
    </>
  );
}
