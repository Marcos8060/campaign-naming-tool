'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { ApiError } from '@/lib/api/request';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const FIELDS = [
  { key: 'name',           label: 'Full Name',                type: 'text',     placeholder: 'Jane Smith' },
  { key: 'workspace_name', label: 'Company / Workspace Name', type: 'text',     placeholder: 'Acme Marketing' },
  { key: 'email',          label: 'Work Email',               type: 'email',    placeholder: 'jane@acme.com' },
  { key: 'password',       label: 'Password',                 type: 'password', placeholder: '8+ characters' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', workspace_name: '' });

  const pwStrength = form.password.length === 0 ? 0
    : form.password.length < 8 ? 1
    : form.password.length < 12 ? 2 : 3;

  const pwColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-positive'];
  const pwLabels = ['', 'Too short', 'Good', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.workspace_name);
      toast.success('Workspace created!');
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : undefined;
      toast.error(message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `rounded-xl py-2.5 text-[#0f1c3f] placeholder:text-[#9ca3af]
    focus:border-brand focus:ring-brand/20 transition-all`;

  return (
    <>
      <h2 className="text-2xl font-extrabold text-[#0f1c3f] mb-1">Create your workspace</h2>
      <p className="text-[#6b7280] text-sm mb-7">Get started with Camparc in under 2 minutes</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-[#0f1c3f] mb-1.5">{label}</label>
            <div className="relative">
              <Input
                type={key === 'password' ? (showPw ? 'text' : 'password') : type}
                required
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{ backgroundColor: '#f5f8ff', borderColor: '#dde5f4' }}
                className={`${inputCls} ${key === 'password' ? 'pr-10' : ''}`}
                placeholder={placeholder}
              />
              {key === 'password' && (
                <Button
                  type="button"
                  variant="text"
                  size="icon"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              )}
            </div>
            {key === 'password' && form.password.length > 0 && (
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
        ))}

        <div className="flex items-start gap-2 pt-1">
          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#6b7280]">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <Button
          type="submit"
          variant="text"
          loading={loading}
          className="w-full py-3 px-4 primary-gradient text-white font-bold rounded-xl hover:opacity-90 shadow-sm shadow-primary/20 text-sm"
        >
          Create Free Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6b7280]">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
      </p>
    </>
  );
}
