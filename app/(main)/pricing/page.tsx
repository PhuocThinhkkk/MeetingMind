"use client";
import SideBarHeader from "@/components/side-bar-header";
import PricingSection from "./pricing-page";

/**
 * Renders the Pricing page containing a sidebar header and the pricing section.
 *
 * @returns The React element for the Pricing page layout, including a SideBarHeader with the title "Pricing" and a container that wraps the PricingSection.
 */
export default function Page() {
  return (
    <>
        <SideBarHeader header="Pricing" />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <PricingSection />
        </div></>
  );
}
