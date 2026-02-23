import { Suspense } from 'react'
import SideBarHeader from '@/components/side-bar-header'
import CalendarPage from './calendar-page'

export default function CalendarPageContainer() {
    return (
        <>
            <SideBarHeader header="Calendar" />
            <div className="container mx-auto px-12 py-2 ">
                <div className="mb-4"></div>
                <Suspense fallback={<div>Loading...</div>}>
                    <CalendarPage />
                </Suspense>
            </div>
        </>
    )
}

