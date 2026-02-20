import { AudioProvider } from '@/components/context/audios-list-context'
import TranscriptHistoryPage from './transcript-history-page'
import { Suspense } from 'react'
import SideBarHeader from '@/components/side-bar-header'

export default function HistoryPage() {
  return (
    <>
      <SideBarHeader header="Audio History" />
      <div className="container mx-auto px-12 py-2 ">
        {' '}
        <div className="mb-4"></div>
        <Suspense fallback={<div>Loading...</div>}>
          <AudioProvider>
            <TranscriptHistoryPage />
          </AudioProvider>
        </Suspense>
      </div>
    </>
  )
}
