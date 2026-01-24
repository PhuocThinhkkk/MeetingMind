import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

/**
 * Renders a payment confirmation page with a success icon, confirmation text, support contact link, and a button to navigate back to the home page.
 *
 * @returns The JSX element for the payment success page.
 */
export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-2xl shadow-2xl rounded-3xl bg-white dark:bg-gray-900">
        <CardContent className="p-6 sm:p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-700">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-100" />
          </div>

          <h1 className="text-4xl font-extrabold text-green-700 dark:text-green-400">
            Payment Successful!
          </h1>

          <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
            Thank you for your purchase.
          </p>

          <p className="mt-4 text-sm text-gray-700 dark:text-gray-400">
            If you have any questions or need further assistance, feel free to
            contact us at{" "}
            <a
              href="mailto:admin@eliteai.tools"
              className="font-medium text-indigo-600 underline dark:text-indigo-400"
            >
              admin@eliteai.tools
            </a>
          </p>

          <div className="mt-10">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600"
            >
              <Link href="/home">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}