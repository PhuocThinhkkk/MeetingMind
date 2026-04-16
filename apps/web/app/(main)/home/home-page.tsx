'use client'
import HomePage from '@/components/dashboard/home-page-entry'
import DashboardSkeleton from '@/components/dashboard/home-page-skeleton'
import dynamic from 'next/dynamic'

const RealtimeRecorderProvider = dynamic(
  () =>
    import('@/components/context/realtime-recorder-context').then(mod => ({
      default: mod.RecorderProvider,
    })),
  {
    ssr: false,
    loading: () => <DashboardSkeleton />,
  }
)

export default function HomePageWrapper() {
  return (
    <RealtimeRecorderProvider>
      <HomePage />
    </RealtimeRecorderProvider>
  )
}
