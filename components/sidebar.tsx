'use client'
import type * as React from 'react'
import { log } from '@/lib/logger'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-init/supabase-browser'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Home, Calendar, History, AudioLines } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FeatureLockWrapper } from './coming-soon-wrapper'

const navItems = [
  {
    title: 'Home',
    url: 'home',
    icon: Home,
  },
  {
    title: 'Calendar',
    url: '#',
    icon: Calendar,
  },
  {
    title: 'History',
    url: 'history',
    icon: History,
  },
  {
    title: 'Pricing',
    url: 'pricing',
    icon: History,
  },
]
/**
 * Load a user profile from the `users` table for the given user ID.
 *
 * @param userId - The id of the user to fetch
 * @returns The user record object if found, `null` when an error occurs or no record is returned
 */
async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    log.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Renders the application's main sidebar with user profile, navigation, and footer; loads the current user's profile when authentication state changes.
 *
 * @returns A Sidebar element populated with the current user's avatar, name, and email (when available), a navigation menu whose active item is derived from the current pathname, and a footer with product branding.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<any>(null)

  const pathName = usePathname()
  const auth = useAuth()
  useEffect(() => {
    loadUserProfile()
  }, [auth.user])

  /**
   * Load the authenticated user's profile into component state or clear it when unauthenticated.
   *
   * When an authenticated user is present, fetches that user's profile data and stores it in the local `user` state; when no authenticated user exists, sets `user` to `null`.
   */
  async function loadUserProfile() {
    if (auth.user) {
      log.info('fetching user profile', auth.user.id)
      const res = await fetchUserProfile(auth.user.id)
      setUser(res)
    } else {
      setUser(null)
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={auth?.user?.user_metadata?.avatar_url || '/placeholder.svg'}
              alt={user?.name}
            />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
              { //@ts-ignore
                (user?.name?.split(' ') ?? []).map(n => n?.[0] ?? '').join('') ||
                '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              {user?.name}
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              {!user?.email
                ? ''
                : user.email.length < 26
                  ? user.email
                  : user.email?.slice(0, 22) + '...'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map(item =>
                item.url === '#' ? (
                  <SidebarMenuItem key={item.title}>
                    <FeatureLockWrapper>
                      <SidebarMenuButton
                        asChild
                        className="h-12 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground "
                      >
                        <a className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </FeatureLockWrapper>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathName === `/${item.url}`}
                      className="h-12 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <AudioLines className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              MeetingMind
            </span>
            <span className="text-xs text-sidebar-foreground/70">v1.0</span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
