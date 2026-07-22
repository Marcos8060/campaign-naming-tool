'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { usePost } from '@/lib/hooks/api';
import { ApiError } from '@/lib/api/request';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPw, setShowPw] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);

  const resetMutation = usePost<{ message: string }, { token: string; new_password: string }>({
    url: '/auth/reset-password',
  });

  const pwStrength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 12 ? 2 : 3;

  const pwColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-positive'];
  const pwLabels = ['', 'Too short', 'Good', 'Strong'];

  const inputCls = `rounded-xl py-3 text-[#0f1c3f] placeholder:text-[#9ca3af]
    focus:border-brand focus:ring-brand/20 transition-all`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }

    try {
      await resetMutation.mutateAsync({ token, new_password: password });
      setDone(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : undefined;
      toast.error(message || 'Could not reset your password');
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0f1c3f] mb-2">Invalid reset link</h2>
        <p className="text-[#6b7280] text-sm leading-relaxed mb-8">
          This link is missing its reset token. Request a new one below.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center px-6 py-3 primary-gradient text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-primary/20 text-sm"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0f1c3f] mb-2">Password updated</h2>
        <p className="text-[#6b7280] text-sm leading-relaxed mb-8">
          You can now sign in with your new password.
        </p>
        <Button
          type="button"
          variant="text"
          onClick={() => router.push('/login')}
          className="w-full py-3.5 px-4 primary-gradient text-white font-bold rounded-xl hover:opacity-90 shadow-sm shadow-primary/20 text-sm"
        >
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-extrabold text-[#0f1c3f] mb-1.5">Set a new password</h2>
      <p className="text-[#6b7280] text-base mb-8">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">
            New password
          </label>
          <div className="relative">
            <Input
              type={showPw ? 'text' : 'password'} required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ backgroundColor: '#f5f8ff', borderColor: '#dde5f4' }}
              className={`${inputCls} pr-10`}
              placeholder="8+ characters"
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
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${pwStrength >= i ? pwColors[pwStrength] : 'bg-[#dde5f4]'}`} />
                ))}
              </div>
              <p className={`text-xs mt-1 font-medium ${pwStrength === 3 ? 'text-positive' : pwStrength === 2 ? 'text-amber-500' : 'text-red-400'}`}>
                {pwLabels[pwStrength]}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">
            Confirm password
          </label>
          <Input
            type={showPw ? 'text' : 'password'} required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ backgroundColor: '#f5f8ff', borderColor: '#dde5f4' }}
            className={inputCls}
            placeholder="Retype your new password"
          />
          {confirmPassword.length > 0 && confirmPassword !== password && (
            <p className="text-xs mt-1.5 font-medium text-red-400">Passwords don&apos;t match</p>
          )}
        </div>

        <Button
          type="submit"
          variant="text"
          loading={resetMutation.isPending}
          className="w-full py-3.5 px-4 primary-gradient text-white font-bold rounded-xl hover:opacity-90 shadow-sm shadow-primary/20 text-sm mt-3"
        >
          Reset password
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
