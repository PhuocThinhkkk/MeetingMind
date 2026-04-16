'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export function HelpModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    {
      title: 'Getting Started, Microphone Audio Setup',
      description:
        'Welcome to the help guide! To enable audio for microphone input, please allow microphone access when prompted by your browser.',
      imageUrl: '/images/micro-audio.png',
    },
    {
      title: 'System Audio Setup',
      description:
        'If you also want to capture audio from another tab or even system audio from your entire computer, ',
      imageUrl: '/images/system-audio.png',
    },
  ]

  const currentPageData = pages[currentPage]

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  function handleClose() {
    setIsOpen(false)
    setCurrentPage(0)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className=" w-8 h-8 rounded-full hover:cursor-pointer bg-white border mx-4 text-gray-700 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center text-xl font-bold"
        aria-label="Open help"
      >
        ?
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">
                {currentPageData.title}
              </h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close help"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Image Section */}
              <div className="w-full h-64 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={currentPageData.imageUrl || '/placeholder.svg'}
                  alt={currentPageData.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-foreground text-base leading-relaxed">
                {currentPageData.description}
              </p>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
              <Button
                onClick={handlePrev}
                disabled={currentPage === 0}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {pages.length}
              </span>

              <Button
                onClick={handleNext}
                disabled={currentPage === pages.length - 1}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
