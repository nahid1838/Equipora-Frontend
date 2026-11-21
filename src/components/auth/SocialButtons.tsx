"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

// Google "G" logo (lucide has no brand icons)
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4">
    <path
      fill="#4285F4"
      d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.44 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.27a12 12 0 0 0 0 10.74l4-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.27 6.63l4 3.09C6.22 6.88 8.87 4.77 12 4.77z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .3.21.67.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

type SocialButtonsProps = {
  callbackURL?: string;
};

// Google + GitHub buttons shared by the Sign In and Sign Up pages
const SocialButtons = ({ callbackURL = "/" }: SocialButtonsProps) => {
  const [pendingProvider, setPendingProvider] = useState<"google" | "github" | null>(null);

  const handleSocialLogin = async (provider: "google" | "github") => {
    if (pendingProvider) return;
    setPendingProvider(provider);
    try {
      const { error } = await authClient.signIn.social({ provider, callbackURL });
      if (error) toast.error("Could not start social sign-in. Please try again.");
    } catch {
      toast.error("Could not start social sign-in. Please try again.");
    } finally {
      setPendingProvider(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pendingProvider !== null}
          onClick={() => handleSocialLogin("google")}
        >
          <GoogleIcon />
          {pendingProvider === "google" ? "Opening…" : "Google"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pendingProvider !== null}
          onClick={() => handleSocialLogin("github")}
        >
          <GitHubIcon />
          {pendingProvider === "github" ? "Opening…" : "GitHub"}
        </Button>
      </div>
    </>
  );
};

export default SocialButtons;
