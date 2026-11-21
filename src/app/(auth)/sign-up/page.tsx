"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialButtons from "@/components/auth/SocialButtons";
import { authClient } from "@/lib/auth-client";

const SignUpPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Assignment rule: uppercase letter, lowercase letter, min 6 characters
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your full name.";
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must include an uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must include a lowercase letter.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
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
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        image: image.trim() || undefined,
      });
      if (error) {
        toast.error("Could not create your account. Check your information or sign in if you already have an account.");
        return;
      }
      toast.success("Account created successfully! Welcome to Equipora.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Could not reach the registration service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Equipora and start renting today"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Full Name
          </label>
          <Input
            id="name"
            placeholder="Your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name}</p>
          )}
        </div>

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

        {/* Photo (direct image link for now; imgbb upload comes with the
            owner equipment form in a later phase) */}
        <div>
          <label htmlFor="photo" className="mb-1.5 block text-sm font-medium">
            Photo URL <span className="text-muted-foreground">(optional)</span>
          </label>
          <div className="flex items-center gap-3">
            <Input
              id="photo"
              placeholder="https://example.com/photo.jpg"
              value={image}
              onChange={(event) => setImage(event.target.value)}
            />
            {image.trim() && (
              <Image
                src={image}
                alt="Profile preview"
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 shrink-0 rounded-full border object-cover"
              />
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <PasswordInput
            id="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Must include an uppercase letter, a lowercase letter, and at least
            6 characters.
          </p>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1.5 block text-sm font-medium"
          >
            Confirm Password
          </label>
          <PasswordInput
            id="confirm-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-6">
        <SocialButtons />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUpPage;
