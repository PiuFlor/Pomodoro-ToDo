export type Priority = 'high' | 'medium' | 'low'
export type TimerMode = 'work' | 'shortBreak' | 'longBreak'

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string | null
  priority: Priority
  completed: boolean
  pomodorosCompleted: number
  createdAt: Date
  updatedAt: Date
}

export interface PomodoroRecord {
  id: string
  taskId: string | null
  taskTitle: string
  startTime: Date
  endTime: Date
  mode: TimerMode
  completed: boolean
}

export interface PomodoroSettings {
  workTime: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
}

export interface TaskFormData {
  title: string
  description: string
  dueDate: string
  priority: Priority
}
