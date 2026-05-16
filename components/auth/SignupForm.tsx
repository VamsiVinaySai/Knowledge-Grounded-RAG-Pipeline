"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Mail, Lock, User, ArrowRight, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!fullName.trim()) e.fullName = "Name is required";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="animate-in text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 ring-1 ring-success/20">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </div>
        <h2 className="font-display text-2xl text-ink">Check your email</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          We sent a confirmation link to{" "}
          <span className="text-amber">{email}</span>. Click it to activate
          your account.
        </p>
        <p className="mt-6 text-sm text-ink-muted">
          <Link href="/login" className="text-amber hover:text-amber-light">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber/10 ring-1 ring-amber/20">
          <FileText className="h-5 w-5 text-amber" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl text-ink">Create account</h1>
          <p className="mt-1 text-sm text-ink-muted">Start chatting with your documents</p>
        </div>
      </div>

      {/* Card */}
      <div className="glass-panel p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            type="text"
            placeholder="Jane Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            leftIcon={<User className="h-3.5 w-3.5" />}
            autoComplete="name"
            autoFocus
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="h-3.5 w-3.5" />}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            leftIcon={<Lock className="h-3.5 w-3.5" />}
            autoComplete="new-password"
            hint="Use at least 8 characters with a mix of letters and numbers"
          />

          <Button
            type="submit"
            variant="amber"
            size="lg"
            loading={loading}
            className="mt-1 w-full"
            rightIcon={!loading ? <ArrowRight className="h-3.5 w-3.5" /> : undefined}
          >
            Create Account
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-5 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-amber transition-colors hover:text-amber-light">
          Sign in
        </Link>
      </p>
    </div>
  );
}
