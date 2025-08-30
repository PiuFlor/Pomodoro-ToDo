import { NextRequest, NextResponse } from 'next/server'
import { updateTask, deleteTask, toggleTaskCompletion, incrementTaskPomodoros } from '../../../lib/database'
import type { TaskFormData } from '../../../types'

export const dynamic = 'force-dynamic'
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Si es una acción específica
    if (body.action === 'toggle') {
      const task = await toggleTaskCompletion(params.id)
      return NextResponse.json(task)
    }
    
    if (body.action === 'increment-pomodoros') {
      const task = await incrementTaskPomodoros(params.id)
      return NextResponse.json(task)
    }
    
    // Actualización normal de tarea
    const taskData: TaskFormData = body
    
    if (!taskData.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    
    const task = await updateTask(params.id, {
      title: taskData.title.trim(),
      description: taskData.description?.trim() || '',
      dueDate: taskData.dueDate || null,
      priority: taskData.priority
    })
    
    return NextResponse.json(task)
  } catch (error) {
    console.error(`PUT /api/tasks/${params.id} error:`, error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTask(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/tasks/${params.id} error:`, error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
