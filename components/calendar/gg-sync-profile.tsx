'use client'

import { useEffect, useState } from 'react'
import { GoogleTokenRow } from '@/types/transcriptions/transcription.db'
import {
  requestGoogleUserProfile,
  UserInforGoogleCalendar,
} from '@/services/google-calendar/user-profile'
import { Loader2, Calendar, Link2 } from 'lucide-react'
import Image from 'next/image'
import { log } from '@/lib/logger'

interface Props {
  token?: GoogleTokenRow | null
}

export default function GoogleSyncProfile({ token }: Props) {
  const [profile, setProfile] = useState<
    UserInforGoogleCalendar | null | undefined
  >(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token?.access_token) return

    const fetchProfile = async () => {
      setLoading(true)
      try {
        const data = await requestGoogleUserProfile()
        setProfile(data)
      } catch (error) {
        log.error('Error when get google profile: ', { error })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [token])

  // Loading state (initial undefined)
  if (typeof token === 'undefined') {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  //  Not connected
  if (token === null) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
        <div className="flex flex-col items-center text-center space-y-4">
          <Calendar className="w-10 h-10 text-blue-500" />

          <div>
            <h3 className="text-lg font-semibold">Connect Google Calendar</h3>
            <p className="text-sm text-gray-500 mt-1">
              Sync your daily events with Google
            </p>
          </div>

          <button
            onClick={() => (window.location.href = '/api/google/connect')}
            className="hover:cursor-pointer flex items-center gap-2 px-5 py-2 rounded-sm bg-blue-700 text-white hover:bg-blue-800 transition"
          >
            <Link2 className="w-4 h-4" />
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm space-y-2">
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : profile ? (
        <div className="flex flex-col gap-3">
          <p className="font-bold">You have signed as:</p>
          <div className="flex flex-1 items-center gap-4">
            <Image
              src={profile.picture}
              alt={profile.name}
              width={56}
              height={56}
              className="rounded-full border"
            />

            <div className="flex-1">
              <p className="font-semibold text-gray-900">{profile.name}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Unable to load profile.</p>
      )}
    </div>
  )
}
