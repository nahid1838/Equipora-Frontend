"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialButtons from "@/components/auth/SocialButtons";
import { authClient } from "@/lib/auth-client";

const SignInPage = () => {
  const router = useRouter();
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

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    setIsLoading(false);

    if (error) {
      toast.error(error.message || "Invalid email or password.");
      return;
    }

    toast.success("Signed in successfully! Welcome back.");
    router.push("/");
    router.refresh();
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
        <SocialButtons onSuccess={() => {}} />
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

export default SignInPage;
