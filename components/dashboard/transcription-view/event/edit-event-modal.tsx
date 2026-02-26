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
        start_time: '',
        end_time: '',
    })

    // Update form when event changes
    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen)
    }

    useEffect(() => {
        if (open && event) {
            setForm({
                title: event.title ?? '',
                description: event.description ?? '',
                location: event.location ?? '',
                start_time: event.start_time ?? '',
                end_time: event.end_time ?? '',
            })
        }

        // Optional: reset when closing
        if (!open) {
            setForm({
                title: '',
                description: '',
                location: '',
                start_time: '',
                end_time: '',
            })
        }
        log.info("event: ", event)
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
                start_time: form.start_time || undefined,
                end_time: form.end_time || undefined,
            }

            const updated = await updateEventById(event.id, cleanedPayload)
            onEventUpdated(updated as EventItemRow)
            toast({ title: 'Saved', description: 'Event updated' })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to update event',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="Event location"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input
                                id="start_time"
                                type="datetime-local"
                                value={form.start_time.slice(0, 16)}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        start_time: new Date(e.target.value).toISOString(),
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_time">End Time</Label>
                            <Input
                                id="end_time"
                                type="datetime-local"
                                value={form.end_time ? form.end_time.slice(0, 16) : ''}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        end_time: e.target.value
                                            ? new Date(e.target.value).toISOString()
                                            : '',
                                    })
                                }
                            />
                        </div>
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
