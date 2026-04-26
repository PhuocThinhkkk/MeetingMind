'use client'
import SideBarHeader from '@/components/side-bar-header'
import HomePageWrapper from './home-page'

export default function Page() {
  return (
    <>
      <SideBarHeader header="Transcription" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <HomePageWrapper />
      </div>
    </>
  )
}
