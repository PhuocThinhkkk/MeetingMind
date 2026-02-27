'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { updateEventById } from '@/lib/queries/browser/events-sumaries-operations'
import { EventItemRow } from '@/types/transcriptions/transcription.db'
import { log } from '@/lib/logger'

interface EditEventModalProps {
  open: boolean
  event: EventItemRow | null
  onOpenChange: (open: boolean) => void
  onEventUpdated: (event: EventItemRow) => void
}

export function EditEventModal({
  open,
  event,
  onOpenChange,
  onEventUpdated,
}: EditEventModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
  })

  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  useEffect(() => {
    if (open && event) {
      setForm({
        title: event.title ?? '',
        description: event.description ?? '',
        location: event.location ?? '',
      })

      setStartDate(event.start_time ? new Date(event.start_time) : undefined)
      setEndDate(event.end_time ? new Date(event.end_time) : undefined)
    }

    if (!open) {
      setForm({
        title: '',
        description: '',
        location: '',
      })
      setStartDate(undefined)
      setEndDate(undefined)
    }

    log.info('event: ', event)
  }, [open, event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    setLoading(true)

    try {
      const cleanedPayload = {
        title: form.title,
        description: form.description,
        location: form.location,
        start_time: startDate ? startDate.toISOString() : undefined,
        end_time: endDate ? endDate.toISOString() : undefined,
      }

      const updated = await updateEventById(event.id, cleanedPayload)

      onEventUpdated(updated as EventItemRow)

      toast({
        title: 'Saved',
        description: 'Event updated successfully',
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const renderDatePicker = (
    label: string,
    date: Date | undefined,
    setDate: (date: Date | undefined) => void
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className=" h-3 w-3" />
            {date ? format(date, 'P p') : 'Pick date & time'}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />

          <div className="p-3 border-t">
            <Input
              type="time"
              onChange={(e) => {
                if (!date) return
                const [hours, minutes] = e.target.value.split(':')
                const newDate = new Date(date)
                newDate.setHours(Number(hours))
                newDate.setMinutes(Number(minutes))
                setDate(newDate)
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the event details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="Event title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Event description"
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
              placeholder="Event location"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {renderDatePicker('Start Time', startDate, setStartDate)}
            {renderDatePicker('End Time', endDate, setEndDate)}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}