'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';

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

  const pwColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-500'];
  const pwLabels = ['', 'Too short', 'Good', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.workspace_name);
      toast.success('Workspace created!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full px-3 py-2.5 border rounded-xl text-sm text-t1 placeholder:text-t3
    focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all`;

  return (
    <>
      <h2 className="text-2xl font-extrabold text-t1 mb-1">Create your workspace</h2>
      <p className="text-t2 text-sm mb-7">Get started with Camparc in under 2 minutes</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-t1 mb-1.5">{label}</label>
            <div className="relative">
              <input
                type={key === 'password' ? (showPw ? 'text' : 'password') : type}
                required
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--bd)' }}
                className={`${inputCls} ${key === 'password' ? 'pr-10' : ''}`}
                placeholder={placeholder}
              />
              {key === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-t3 hover:text-t2"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            {key === 'password' && form.password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${pwStrength >= i ? pwColors[pwStrength] : 'bg-[var(--bd)]'}`} />
                  ))}
                </div>
                <p className={`text-xs mt-1 font-medium ${pwStrength === 3 ? 'text-green-500' : pwStrength === 2 ? 'text-amber-500' : 'text-red-400'}`}>
                  {pwLabels[pwStrength]}
                </p>
              </div>
            )}
          </div>
        ))}

        <div className="flex items-start gap-2 pt-1">
          <CheckCircle2 className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
          <p className="text-xs text-t2">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-3 px-4 brand-gradient text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm shadow-violet-200 text-sm"
        >
          {loading ? 'Creating workspace…' : 'Create Free Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-t2">
        Already have an account?{' '}
        <Link href="/login" className="text-brand font-semibold hover:underline">Sign in</Link>
      </p>
    </>
  );
}
