import "server-only"
import { createServerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Database } from "@/types/database.types"

/**
 * Creates a Supabase server client configured to use Next.js server cookies.
 *
 * @returns A Supabase server client instance typed with `Database` that is configured to use the application's Supabase URL and anon key and to read/write auth cookies via Next.js server cookies.
 */
export async function getSupabseAuthServer(){
  const cookieStore = await cookies()
   return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}