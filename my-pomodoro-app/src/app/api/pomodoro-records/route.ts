import { NextRequest, NextResponse } from 'next/server'
import { getPomodoroRecords, createPomodoroRecord } from '../../lib/database'
import type { TimerMode } from '../../types'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const records = await getPomodoroRecords()
    return NextResponse.json(records)
  } catch (error) {
    console.error('GET /api/pomodoro-records error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pomodoro records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const record = await createPomodoroRecord({
      taskId: body.taskId || null,
      taskTitle: body.taskTitle,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      mode: body.mode as TimerMode,
      completed: body.completed
    })
    
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('POST /api/pomodoro-records error:', error)
    return NextResponse.json(
      { error: 'Failed to create pomodoro record' },
      { status: 500 }
    )
  }
}
