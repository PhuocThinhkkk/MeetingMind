import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-rose-50 to-red-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
        <CardContent className="p-6 text-center sm:p-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-700">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-100" />
          </div>

          <h1 className="text-4xl font-extrabold text-red-700 dark:text-red-400">
            Payment Failed
          </h1>

          <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
            Unfortunately, your payment could not be processed.
          </p>

          <p className="mt-6 text-xl text-red-600 dark:text-red-400">
            Please check your payment details or try again.
          </p>

          <p className="mt-4 text-sm text-gray-700 dark:text-gray-400">
            If the problem persists, contact us at{" "}
            <a
              href="mailto:admin@eliteai.tools"
              className="font-medium text-indigo-600 underline dark:text-indigo-400"
            >
              admin@eliteai.tools
            </a>
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg transition-transform hover:scale-105"
            >
              <Link href="/home">Back to Home</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <Link href="/pricing">Try Again</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
