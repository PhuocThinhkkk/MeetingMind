'use client'
import SideBarHeader from '@/components/side-bar-header'
import PricingSection from './pricing-page'

export default function Page() {
  return (
    <>
      <SideBarHeader header="Pricing" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <PricingSection />
      </div>
    </>
  )
}
