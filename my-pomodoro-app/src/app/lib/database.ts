import { neon } from '@neondatabase/serverless'
import type { Task, PomodoroRecord, PomodoroSettings, Priority, TimerMode } from '../types'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const sql = neon(process.env.DATABASE_URL)

// ==================== TASKS ====================

export async function getTasks(): Promise<Task[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        title,
        description,
        due_date,
        priority,
        completed,
        total_pomodoros,
        created_at,
        updated_at
      FROM tasks 
      ORDER BY created_at DESC
    `
    
    return result.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      dueDate: row.due_date ? row.due_date.toISOString().split('T')[0] : null,
      priority: row.priority as Priority,
      completed: row.completed,
      totalPomodoros: row.total_pomodoros,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }))
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw new Error('Failed to fetch tasks')
  }
}

export async function createTask(taskData: {
  title: string
  description: string
  dueDate: string | null
  priority: Priority
}): Promise<Task> {
  try {
    const result = await sql`
      INSERT INTO tasks (title, description, due_date, priority)
      VALUES (
        ${taskData.title},
        ${taskData.description},
        ${taskData.dueDate || null},
        ${taskData.priority}
      )
      RETURNING *
    `
    
    const row = result[0]
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      dueDate: row.due_date ? row.due_date.toISOString().split('T')[0] : null,
      priority: row.priority as Priority,
      completed: row.completed,
      totalPomodoros: row.total_pomodoros,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error creating task:', error)
    throw new Error('Failed to create task')
  }
}

export async function updateTask(id: string, taskData: {
  title: string
  description: string
  dueDate: string | null
  priority: Priority
}): Promise<Task> {
  try {
    const result = await sql`
      UPDATE tasks 
      SET 
        title = ${taskData.title},
        description = ${taskData.description},
        due_date = ${taskData.dueDate || null},
        priority = ${taskData.priority},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    if (result.length === 0) {
      throw new Error('Task not found')
    }
    
    const row = result[0]
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      dueDate: row.due_date ? row.due_date.toISOString().split('T')[0] : null,
      priority: row.priority as Priority,
      completed: row.completed,
      totalPomodoros: row.total_pomodoros,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error updating task:', error)
    throw new Error('Failed to update task')
  }
}

export async function toggleTaskCompletion(id: string): Promise<Task> {
  try {
    const result = await sql`
      UPDATE tasks 
      SET 
        completed = NOT completed,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    if (result.length === 0) {
      throw new Error('Task not found')
    }
    
    const row = result[0]
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      dueDate: row.due_date ? row.due_date.toISOString().split('T')[0] : null,
      priority: row.priority as Priority,
      completed: row.completed,
      totalPomodoros: row.total_pomodoros,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error toggling task completion:', error)
    throw new Error('Failed to toggle task completion')
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM tasks 
      WHERE id = ${id}
    `
    
    if (result.length === 0) {
      throw new Error('Task not found')
    }
  } catch (error) {
    console.error('Error deleting task:', error)
    throw new Error('Failed to delete task')
  }
}

export async function incrementTaskPomodoros(id: string): Promise<Task> {
  try {
    const result = await sql`
      UPDATE tasks 
      SET 
        total_pomodoros = total_pomodoros + 1,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    if (result.length === 0) {
      throw new Error('Task not found')
    }
    
    const row = result[0]
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      dueDate: row.due_date ? row.due_date.toISOString().split('T')[0] : null,
      priority: row.priority as Priority,
      completed: row.completed,
      totalPomodoros: row.total_pomodoros,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error incrementing task pomodoros:', error)
    throw new Error('Failed to increment task pomodoros')
  }
}

// ==================== POMODORO RECORDS ====================

export async function getPomodoroRecords(): Promise<PomodoroRecord[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        task_id,
        task_title,
        start_time,
        end_time,
        mode,
        completed,
        created_at
      FROM pomodoro_records 
      ORDER BY end_time DESC
    `
    
    return result.map(row => ({
      id: row.id,
      taskId: row.task_id,
      taskTitle: row.task_title,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      mode: row.mode as TimerMode,
      completed: row.completed
    }))
  } catch (error) {
    console.error('Error fetching pomodoro records:', error)
    throw new Error('Failed to fetch pomodoro records')
  }
}

export async function createPomodoroRecord(recordData: {
  taskId: string | null
  taskTitle: string
  startTime: Date
  endTime: Date
  mode: TimerMode
  completed: boolean
}): Promise<PomodoroRecord> {
  try {
    const result = await sql`
      INSERT INTO pomodoro_records (task_id, task_title, start_time, end_time, mode, completed)
      VALUES (
        ${recordData.taskId},
        ${recordData.taskTitle},
        ${recordData.startTime.toISOString()},
        ${recordData.endTime.toISOString()},
        ${recordData.mode},
        ${recordData.completed}
      )
      RETURNING *
    `
    
    const row = result[0]
    return {
      id: row.id,
      taskId: row.task_id,
      taskTitle: row.task_title,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      mode: row.mode as TimerMode,
      completed: row.completed
    }
  } catch (error) {
    console.error('Error creating pomodoro record:', error)
    throw new Error('Failed to create pomodoro record')
  }
}

// ==================== SETTINGS ====================

export async function getPomodoroSettings(): Promise<PomodoroSettings> {
  try {
    const result = await sql`
      SELECT work_time, short_break, long_break, long_break_interval
      FROM pomodoro_settings 
      ORDER BY created_at DESC 
      LIMIT 1
    `
    
    if (result.length === 0) {
      // Crear configuración por defecto si no existe
      return await createPomodoroSettings({
        workTime: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4
      })
    }
    
    const row = result[0]
    return {
      workTime: row.work_time,
      shortBreak: row.short_break,
      longBreak: row.long_break,
      longBreakInterval: row.long_break_interval
    }
  } catch (error) {
    console.error('Error fetching pomodoro settings:', error)
    throw new Error('Failed to fetch pomodoro settings')
  }
}

export async function createPomodoroSettings(settings: PomodoroSettings): Promise<PomodoroSettings> {
  try {
    const result = await sql`
      INSERT INTO pomodoro_settings (work_time, short_break, long_break, long_break_interval)
      VALUES (${settings.workTime}, ${settings.shortBreak}, ${settings.longBreak}, ${settings.longBreakInterval})
      RETURNING *
    `
    
    const row = result[0]
    return {
      workTime: row.work_time,
      shortBreak: row.short_break,
      longBreak: row.long_break,
      longBreakInterval: row.long_break_interval
    }
  } catch (error) {
    console.error('Error creating pomodoro settings:', error)
    throw new Error('Failed to create pomodoro settings')
  }
}

export async function updatePomodoroSettings(settings: PomodoroSettings): Promise<PomodoroSettings> {
  try {
    // Eliminar configuraciones anteriores y crear nueva
    await sql`DELETE FROM pomodoro_settings`
    
    const result = await sql`
      INSERT INTO pomodoro_settings (work_time, short_break, long_break, long_break_interval)
      VALUES (${settings.workTime}, ${settings.shortBreak}, ${settings.longBreak}, ${settings.longBreakInterval})
      RETURNING *
    `
    
    const row = result[0]
    return {
      workTime: row.work_time,
      shortBreak: row.short_break,
      longBreak: row.long_break,
      longBreakInterval: row.long_break_interval
    }
  } catch (error) {
    console.error('Error updating pomodoro settings:', error)
    throw new Error('Failed to update pomodoro settings')
  }
}
