'use client'

import { useState } from 'react'
import { TranscriptionDialog } from '@/components/dashboard/transcription-view/transcription-main-view-dialog'
import { TranscriptionDataUpload } from '@/types/transcription.db'

const now = new Date().toISOString()

const mockData: TranscriptionDataUpload = {
    // ===== audio_files =====
    audioFile: {
        id: 'b7b6c9a2-2f4c-4f93-9b12-1d2c9b1a1111',
        name: 'Q1 Planning Meeting.mp3',
        duration: 5538, // seconds
        created_at: now,
        transcription_status: 'done',
    },

    // ===== transcripts =====
    transcript: {
        id: 'd9a4f33a-9c73-4f8a-a5b2-6c9d88882222',
        text: `
[00:00] Speaker 1: Good morning everyone, thanks for joining our Q1 planning meeting.
[00:15] Speaker 2: Last quarter we achieved 95% of our goals.
[00:42] Speaker 3: Marketing ROI reached 340%.
[01:05] Speaker 1: For Q1, our priorities are expansion, retention, and sales optimization.
    `.trim(),
        speakers_detected: 3,
    },

    // ===== summaries =====
    summary: {
        text:
            'The meeting reviewed Q4 performance, highlighting 95% goal achievement and a 340% marketing ROI. Q1 priorities include product expansion, customer retention, and sales funnel optimization.',
        highlights: [
            '95% of Q4 targets achieved',
            'Marketing ROI reached 340%',
            'Clear Q1 priorities defined',
        ],
        todo: [
            'Finalize Q1 roadmap',
            'Review marketing budget',
            'Schedule sales sync',
            'Research AI transcription tools',
        ],
    },

    // ===== events =====
    events: [
        {
            id: 'f6c12d3e-1a23-4c99-8b91-123456789001',
            title: 'Q1 Roadmap Review',
            start_time: new Date(Date.now() + 86400000).toISOString(),
            end_time: new Date(Date.now() + 90000000).toISOString(),
            location: 'Zoom',
            added_to_google_calendar: false,
        },
        {
            id: 'f6c12d3e-1a23-4c99-8b91-123456789002',
            title: 'Sales Strategy Sync',
            start_time: new Date(Date.now() + 172800000).toISOString(),
            end_time: null ?? undefined,
            location: 'HQ – Meeting Room A',
            added_to_google_calendar: true,
        },
    ],

    // ===== qa_logs =====
    qaLogs: [
        {
            id: 'aa11bb22-cc33-dd44-ee55-ff6600000001',
            question: 'What are the priorities for Q1?',
            answer:
                'The priorities are product expansion, improving customer retention, and optimizing the sales funnel.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: 'aa11bb22-cc33-dd44-ee55-ff6600000002',
            question: 'How did marketing perform last quarter?',
            answer:
                'Marketing performed exceptionally well, achieving a 340% return on investment.',
            created_at: new Date(Date.now() - 1800000).toISOString(),
        },
    ],
}

export default function TranscriptionPreviewPage() {
    const [open, setOpen] = useState(true)

    return (
        <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">
                Transcription Dialog – Preview
            </h1>

            <p className="text-gray-600 mb-6">
                This page uses mock data to test the transcription dialog UI.
            </p>

            <TranscriptionDialog
                open={open}
                onClose={() => setOpen(false)}
                data={mockData}
            />
        </div>
    )
}
