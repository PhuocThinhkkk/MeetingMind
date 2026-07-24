import { Languages } from 'lucide-react'

export function EmptyTranslation() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Languages className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        Ready to translate
      </h3>
      <p className="text-gray-500">Translation will appear as you speak</p>
    </div>
  )
}
