"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Mail, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/documents");
    router.refresh();
  };

  return (
    <div className="animate-in">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber/10 ring-1 ring-amber/20">
          <FileText className="h-5 w-5 text-amber" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in to DocAI</p>
        </div>
      </div>

      {/* Card */}
      <div className="glass-panel p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="h-3.5 w-3.5" />}
            autoComplete="email"
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            leftIcon={<Lock className="h-3.5 w-3.5" />}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="amber"
            size="lg"
            loading={loading}
            className="mt-1 w-full"
            rightIcon={!loading ? <ArrowRight className="h-3.5 w-3.5" /> : undefined}
          >
            Sign In
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-5 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-amber transition-colors hover:text-amber-light"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
