import { NextRequest, NextResponse } from 'next/server'
import { getPomodoroSettings, updatePomodoroSettings } from '../../lib/database'
import type { PomodoroSettings } from '../../types'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const settings = await getPomodoroSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: PomodoroSettings = await request.json()
    
    // Validar datos
    if (body.workTime < 1 || body.workTime > 60) {
      return NextResponse.json(
        { error: 'Work time must be between 1 and 60 minutes' },
        { status: 400 }
      )
    }
    
    if (body.shortBreak < 1 || body.shortBreak > 30) {
      return NextResponse.json(
        { error: 'Short break must be between 1 and 30 minutes' },
        { status: 400 }
      )
    }
    
    if (body.longBreak < 1 || body.longBreak > 60) {
      return NextResponse.json(
        { error: 'Long break must be between 1 and 60 minutes' },
        { status: 400 }
      )
    }
    
    if (body.longBreakInterval < 2 || body.longBreakInterval > 10) {
      return NextResponse.json(
        { error: 'Long break interval must be between 2 and 10' },
        { status: 400 }
      )
    }
    
    const settings = await updatePomodoroSettings(body)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('PUT /api/settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
