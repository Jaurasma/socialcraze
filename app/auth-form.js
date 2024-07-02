"use client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const handleAuthCallback = () => {
  console.log("Auth callback executed");
  // Add any additional logic here
};

export default function AuthForm() {
  const supabase = createClientComponentClient();

  return (
    <Auth
      supabaseClient={supabase}
      view="sign_up"
      appearance={{ theme: ThemeSupa }}
      theme="dark"
      showLinks={true}
      providers={[]}
      callbacks={{ signedIn: handleAuthCallback }}
      redirectTo="http://localhost:3000/auth/callback"
    />
  );
}
