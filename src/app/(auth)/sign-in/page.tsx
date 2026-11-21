"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialButtons from "@/components/auth/SocialButtons";
import { authClient } from "@/lib/auth-client";

const SignInForm = () => {
  const router = useRouter();
  const returnTo = useSearchParams().get("returnTo");
  // Accept only the internal routes that send visitors here to sign in.
  const destination =
    returnTo &&
    (/^\/equipment\/(?:[\w.!'()*~-]|%[\da-f]{2})+$/i.test(returnTo) ||
      /^\/dashboard(?:\/(?:customer|owner|admin)(?:\/[a-z-]+)?)?$/.test(returnTo) ||
      /^\/booking\/payment\/[\da-f]{24}$/i.test(returnTo)) &&
    new URL(returnTo, "https://equipora.invalid").pathname === returnTo
      ? returnTo
      : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Please enter your password.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        toast.error(error.status === 401 ? "Invalid email or password." : "Could not sign in. Please try again.");
        return;
      }
      toast.success("Signed in successfully! Welcome back.");
      router.push(destination);
      router.refresh();
    } catch {
      toast.error("Could not reach the sign-in service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            {/* Not implemented per assignment instructions — shows a friendly note */}
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-primary"
              onClick={() =>
                toast.info("Password recovery is not available right now.")
              }
            >
              Forgot password?
            </button>
          </div>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6">
        <SocialButtons callbackURL={destination} />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

export default function SignInPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Welcome Back!" subtitle="Sign in to your account to continue">
        <div role="status" className="space-y-4">
          <span className="sr-only">Loading sign in…</span>
          {[1, 2, 3].map((row) => <div key={row} aria-hidden="true" className="h-10 rounded-lg bg-muted motion-safe:animate-pulse" />)}
        </div>
      </AuthLayout>
    }>
      <SignInForm />
    </Suspense>
  );
}
