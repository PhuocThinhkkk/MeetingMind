"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const serverCheck = async () => {
      try {

        let wsDomain =
          process.env.NEXT_PUBLIC_WEBSOCKET_URL || "localhost:9090";
        wsDomain = wsDomain.replace(/^wss?:\/\//, "");
        const protocol = location.protocol;
        const wsUrl = `${protocol}://${wsDomain}`;

        const res = await fetch(`${wsUrl}`);
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }
      } catch (error) {
        console.error("Server is not reachable:", error);
      }

    };
    serverCheck();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/home");
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

