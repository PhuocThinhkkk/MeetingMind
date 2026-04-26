import SideBarHeader from '@/components/side-bar-header'
import SubscriptionPage from './billing-setting-page'

export default function Page() {
  return (
    <>
      <SideBarHeader header="Subscription Management" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <SubscriptionPage />
      </div>
    </>
  )
}
