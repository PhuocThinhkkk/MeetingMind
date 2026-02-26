import { useTranscriptionView } from '@/components/context/transcription-view-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export function SummaryTab() {
  const { summary } = useTranscriptionView()
  if (!summary) {
    return <p className="text-gray-500">No summary available.</p>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{summary.text}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Highlights</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[30vh] overflow-y-auto pr-2">
            <ul className="space-y-2">
              {summary.highlights?.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Action Items</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[30vh] overflow-y-auto pr-2">
            <ul className="space-y-2">
              {summary.todo?.map((item, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-3" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div >
    </div >
  )
}
