import { NextRequest, NextResponse } from 'next/server'
import { getTasks, createTask } from '../../lib/database'
import type { TaskFormData } from '../../types'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const tasks = await getTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TaskFormData = await request.json()
    
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    
    const task = await createTask({
      title: body.title.trim(),
      description: body.description?.trim() || '',
      dueDate: body.dueDate || null,
      priority: body.priority
    })
    
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
