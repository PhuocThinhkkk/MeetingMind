export async function getGoogleUserProfile(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch Google user profile')
  }

  const data = await res.json()
  return data as UserInforGoogleCalendar
}

export type UserInforGoogleCalendar = {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}
