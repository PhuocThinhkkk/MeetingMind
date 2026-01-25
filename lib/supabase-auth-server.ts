import 'server-only'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

/**
 * Create a Supabase server client that reads and writes auth cookies via Next.js server cookies.
 *
 * @returns A Supabase server client (typed with `Database`) configured with the application's Supabase URL and anon key and wired to Next.js server cookies for auth.
 */
export async function getSupabseAuthServer() {
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

/**
 * Fetches the authenticated Supabase user from the server-side auth session.
 *
 * @returns The authenticated user object if a session exists, `null` otherwise.
 */
export async function getUserAuthInSupabaseToken() {
  const supabaseAuth = await getSupabseAuthServer()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()
  return user
}