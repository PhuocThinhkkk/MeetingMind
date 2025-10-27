"use client";
import { useAuth } from "@/hooks/use-auth";

export default function GoogleSignInButton() {
  const { signInWithGoogle } = useAuth();

  return (
    <button
      onClick={signInWithGoogle}
      className="flex my-4 w-full hover:cursor-pointer hover:bg-gray-200 items-center justify-center gap-3 w-full px-5 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 font-medium shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        width={20}
        height={20}
        className="pointer-events-none"
      />
      <span>Sign in with Google</span>
    </button>
  );
}

