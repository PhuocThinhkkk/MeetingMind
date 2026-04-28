import 'server-only'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient, User } from '@supabase/supabase-js'
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

function getBearerToken(value?: string | null) {
  if (!value) return null
  const [type, token] = value.split(' ')
  if (type?.toLowerCase() !== 'bearer' || !token) {
    return null
  }
  return token
}

export async function getUserFromAccessToken(
  accessToken: string
): Promise<User | null> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken)

  return user
}

/**
 * Fetches the authenticated Supabase user from the server-side auth session.
 *
 * @returns The authenticated user object if a session exists, `null` otherwise.
 */
export async function getUserAuthInSupabaseToken(req?: Request) {
  const accessToken = getBearerToken(
    req?.headers.get('authorization') ?? req?.headers.get('Authorization')
  )

  if (accessToken) {
    const user = await getUserFromAccessToken(accessToken)
    if (user) {
      return user
    }
  }

  const supabaseAuth = await getSupabseAuthServer()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()
  return user
}
