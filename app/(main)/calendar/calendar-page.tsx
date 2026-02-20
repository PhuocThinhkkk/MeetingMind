"use client"
import CalendarEntry from "@/components/calendar/calendar-page";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { getAllEventsByUserId } from "@/lib/queries/browser/events-sumaries-operations";
import { EventItemRow } from "@/types/transcriptions/transcription.db";
import { useEffect, useState } from "react";

export default function CalendarPage() {
    const [events, setEvents] = useState<undefined | null | EventItemRow[]>(undefined)
    const { user } = useAuth()
    useEffect(() => {
        fetchAllEvents()
    }, [user?.id])

    async function fetchAllEvents() {
        try {
            if (!user) return
            const events = await getAllEventsByUserId()
            setEvents(events)
        } catch (e) {
            toast({
                title: "Error when query events",
                description: `${e}`,
                variant: "destructive"
            })
        }
    }
    return <CalendarEntry events={events ?? []} />
}