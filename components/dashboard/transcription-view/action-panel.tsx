import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Download, Share } from 'lucide-react'

// TODO: IMPLEMENT LATER
export function ActionPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start">
          <Download className="w-4 h-4 mr-2" />
          Export Transcript
        </Button>

        <Button variant="outline" size="sm" className="w-full justify-start">
          <Share className="w-4 h-4 mr-2" />
          Share Summary
        </Button>

        <Button variant="outline" size="sm" className="w-full justify-start">
          <Calendar className="w-4 h-4 mr-2" />
          Create Events
        </Button>
      </CardContent>
    </Card>
  )
}
