/**
 * Fetches the Google user profile associated with the provided OAuth access token.
 *
 * @param accessToken - The OAuth 2.0 access token used in the Authorization Bearer header
 * @returns The user's Google profile as a `UserInforGoogleCalendar` object
 * @throws Error if the HTTP response is not successful
 */
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