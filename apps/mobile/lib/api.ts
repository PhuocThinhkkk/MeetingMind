import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { MOBILE_CONFIG, requireConfig } from '@/lib/env';
import { EventItemRow, GoogleProfile } from '@/types/domain';

WebBrowser.maybeCompleteAuthSession();

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const baseUrl = requireConfig(MOBILE_CONFIG.apiBaseUrl, 'EXPO_PUBLIC_API_BASE_URL');
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.accessToken
        ? {
            Authorization: `Bearer ${options.accessToken}`,
          }
        : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const payload = await response.json();
      errorMessage = payload.error ?? errorMessage;
    } catch {
      // ignore json parse failures
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export type CreateUrlUploadBody = {
  name: string;
  duration: number;
  size: number;
  type: string;
  isUpload: boolean;
};

export type CreateUploadUrlResult = {
  path: string;
  signedUrl: string;
  token: string;
  contentType: string;
};

export async function createUploadUrl(input: CreateUrlUploadBody, accessToken: string) {
  return apiRequest<CreateUploadUrlResult>('/api/audiofile/create-url-upload', {
    method: 'POST',
    body: input,
    accessToken,
  });
}

export async function triggerTranscript(
  audioId: string,
  input: { path: string; size: number; duration: number },
  accessToken: string
) {
  return apiRequest(`/api/audiofile/${audioId}/trigger-transcript`, {
    method: 'POST',
    body: input,
    accessToken,
  });
}

export async function triggerAnalyze(audioId: string, accessToken: string) {
  return apiRequest(`/api/audiofile/${audioId}/analyze`, {
    method: 'POST',
    accessToken,
  });
}

export async function askMeetingQuestion(
  payload: { question: string; transcript: string; passQA?: string[] },
  accessToken: string
) {
  return apiRequest<{ answer: string; qa: { answer: string } }>('/api/qa/chat', {
    method: 'POST',
    body: payload,
    accessToken,
  });
}

export async function fetchGoogleProfile(accessToken: string) {
  return apiRequest<GoogleProfile>('/api/google/get-profile', {
    method: 'POST',
    accessToken,
  });
}

export async function syncEventToGoogleCalendar(eventId: string, accessToken: string) {
  return apiRequest<{ success: true }>(`/api/google/sync?event_id=${eventId}`, {
    method: 'POST',
    accessToken,
  });
}

export async function connectGoogleCalendar(accessToken: string) {
  const baseUrl = requireConfig(MOBILE_CONFIG.webBaseUrl, 'EXPO_PUBLIC_WEB_BASE_URL');
  const returnUrl = Linking.createURL('/calendar-return');
  const authUrl = `${baseUrl}/api/google/connect?access_token=${encodeURIComponent(
    accessToken
  )}&redirect_to=${encodeURIComponent(returnUrl)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);
  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Google Calendar connection cancelled');
  }
  return result;
}
