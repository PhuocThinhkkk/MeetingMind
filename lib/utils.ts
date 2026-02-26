import { log } from '@/lib/logger'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Compose and merge class values into a single class string, resolving Tailwind CSS conflicts.
 *
 * @param inputs - Class value inputs (strings, arrays, objects, etc.) to combine
 * @returns The merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
