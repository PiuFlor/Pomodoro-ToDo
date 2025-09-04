import { useState, useEffect } from 'react'
import type { Task, PomodoroRecord, PomodoroSettings, TaskFormData, TimerMode } from '../types'

// Hook para manejar tareas con base de datos
export function useTasksDatabase() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar tareas
  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Crear tarea
  const createTask = async (taskData: TaskFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      
      if (!response.ok) throw new Error('Failed to create task')
      
      const newTask = await response.json()
      setTasks(prev => [newTask, ...prev])
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error creating task:', err)
      return false
    }
  }

  // Actualizar tarea
  const updateTask = async (id: string, taskData: TaskFormData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      
      if (!response.ok) throw new Error('Failed to update task')
      
      const updatedTask = await response.json()
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error updating task:', err)
      return false
    }
  }

  // Toggle completado
  const toggleTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' })
      })
      
      if (!response.ok) throw new Error('Failed to toggle task')
      
      const updatedTask = await response.json()
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error toggling task:', err)
    }
  }

  // Eliminar tarea
  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete task')
      
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error deleting task:', err)
    }
  }

  // Incrementar pomodoros
  const incrementTaskPomodoros = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment-pomodoros' })
      })
      
      if (!response.ok) throw new Error('Failed to increment pomodoros')
      
      const updatedTask = await response.json()
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error incrementing pomodoros:', err)
    }
  }

  // Cargar al montar
  useEffect(() => {
    loadTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    incrementTaskPomodoros,
    refreshTasks: loadTasks
  }
}

// Hook para manejar registros de pomodoro
export function usePomodoroRecordsDatabase() {
  const [records, setRecords] = useState<PomodoroRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar registros
  const loadRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pomodoro-records')
      if (!response.ok) throw new Error('Failed to fetch records')
      const data: PomodoroRecord[] = await response.json()

      // ✅ Normalizar fechas y crear nueva referencia
      const normalizedRecords = data.map(record => ({
        ...record,
        endTime: typeof record.endTime === 'string' ? new Date(record.endTime) : record.endTime,
        startTime: typeof record.startTime === 'string' ? new Date(record.startTime) : record.startTime
      }))
      
      setRecords(normalizedRecords)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error loading records:', err)
    } finally {
      setLoading(false)
    }
  }

  // Crear registro
  const createRecord = async (recordData: {
    taskId: string | null
    taskTitle: string
    startTime: Date
    endTime: Date
    mode: TimerMode
    completed: boolean
  }) => {
    try {
      const response = await fetch('/api/pomodoro-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      })
      
      if (!response.ok) throw new Error('Failed to create record')
      
      const newRecord = await response.json()
      
      // ✅ Normalizar fechas del nuevo registro
      const normalizedRecord = {
        ...newRecord,
        endTime: typeof newRecord.endTime === 'string' ? new Date(newRecord.endTime) : newRecord.endTime,
        startTime: typeof newRecord.startTime === 'string' ? new Date(newRecord.startTime) : newRecord.startTime
      }
      
      // ✅ Actualizar estado local inmediatamente
      setRecords(prev => [normalizedRecord, ...prev])
      return normalizedRecord
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error creating record:', err)
      return null
    }
  }

  // Cargar al montar
  useEffect(() => {
    loadRecords()
  }, [])

  return {
    records,
    loading,
    error,
    createRecord,
    refreshRecords: loadRecords
  }
}

// Hook para configuraciones
export function useSettingsDatabase() {
  const [settings, setSettings] = useState<PomodoroSettings>({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuraciones
  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error loading settings:', err)
    } finally {
      setLoading(false)
    }
  }

  // Actualizar configuraciones
  const updateSettings = async (newSettings: PomodoroSettings): Promise<boolean> => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })
      
      if (!response.ok) throw new Error('Failed to update settings')
      
      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error updating settings:', err)
      return false
    }
  }

  // Cargar al montar
  useEffect(() => {
    loadSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings: loadSettings
  }
}