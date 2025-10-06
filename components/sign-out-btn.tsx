"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function SignOutBtn() {

  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/auth/login");
  }
  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut}>
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  );
}
