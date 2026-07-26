import { Languages } from 'lucide-react'

export function EmptyTranslation() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Languages className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        Ready to translate
      </h3>
      <p className="text-muted-foreground">
        Translation will appear as you speak
      </p>
    </div>
  )
}
