import { useState, useEffect } from 'react'
import type { Task, TaskFormData } from '../types'

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  // Cargar tareas del localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('pomodoro-tasks')
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }))
      setTasks(parsedTasks)
    }
  }, [])

  // Guardar tareas en localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (taskData: TaskFormData) => {
    if (taskData.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        dueDate: taskData.dueDate || null,
        priority: taskData.priority,
        completed: false,
        totalPomodoros: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setTasks(prev => [...prev, task])
      return true
    }
    return false
  }

  const updateTask = (updatedTask: Task) => {
    if (updatedTask.title.trim()) {
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id 
          ? { ...updatedTask, updatedAt: new Date() }
          : task
      ))
      return true
    }
    return false
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed, updatedAt: new Date() } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
    if (activeTaskId === id) {
      setActiveTaskId(null)
    }
  }

  const selectActiveTask = (id: string) => {
    setActiveTaskId(activeTaskId === id ? null : id)
  }

  const updateTaskPomodoros = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, pomodorosCompleted: task.totalPomodoros + 1, updatedAt: new Date() }
        : task
    ))
  }

  return {
    tasks,
    activeTaskId,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    selectActiveTask,
    updateTaskPomodoros
  }
}
