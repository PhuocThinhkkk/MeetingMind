import { NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import {
  getUserSubscriptionServer,
  updateCancelSupscription,
  updateResumeSubscription,
} from '@/lib/queries/server/stripe-subscription-operations'

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
    console.error('Resume subscription error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
