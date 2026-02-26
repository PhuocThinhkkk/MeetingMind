import { log } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import {
  getUserSubscriptionServer,
  updateResumeSubscription,
} from '@/lib/queries/server/stripe-subscription-operations'

/**
 * Resumes the authenticated user's subscription and returns the result as an HTTP response.
 *
 * If the request is unauthenticated, responds with a 401 status and an error message.
 * On successful resume, responds with a 200 status and `{ success: true }`.
 * On failure, logs the error and responds with a 500 status and a generic error message.
 *
 * @returns An HTTP JSON response: `{ success: true }` with status 200 on success, or an error object with status 401 or 500 on failure.
 */
export async function POST() {
  try {
    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const sub = await getUserSubscriptionServer(user.id)

    await updateResumeSubscription(sub)

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    )
  } catch (err) {
    log.error('Resume subscription error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
