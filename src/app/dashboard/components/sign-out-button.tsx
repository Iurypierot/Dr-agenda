"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const SignOutButton = () => {
  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/authentication"; // força redirecionamento
  };

  return <Button onClick={handleSignOut}>Sair</Button>;
};

export default SignOutButton;
