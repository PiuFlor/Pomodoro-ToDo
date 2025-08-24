"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Target, BarChart3 } from 'lucide-react'
import PomodoroTimer from './components/PomodoroTimer'
import TaskList from './components/TaskList'
import StatsPanel from './components/StatsPanel'
import { usePomodoroTimer } from './hooks/usePomodoroTimer'
import { useTaskManager } from './hooks/useTaskManager'
import { useStatsCalculator } from './hooks/useStatsCalculator'
import type { Task, PomodoroRecord, PomodoroSettings } from './types'

export default function PomodoroTodoApp() {
  const [pomodoroHistory, setPomodoroHistory] = useState<PomodoroRecord[]>([])
  const [settings, setSettings] = useState<PomodoroSettings>({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4
  })

  // Custom hooks
  const {
    tasks,
    activeTaskId,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    selectActiveTask
  } = useTaskManager()

  const {
    timeLeft,
    isRunning,
    mode,
    completedPomodoros,
    toggleTimer,
    resetTimer,
    switchMode,
    handleTimerComplete: originalHandleTimerComplete
  } = usePomodoroTimer(settings)

  const statsCalculator = useStatsCalculator(pomodoroHistory)

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem('pomodoro-history')
    const savedSettings = localStorage.getItem('pomodoro-settings')

    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory).map((record: any) => ({
        ...record,
        startTime: new Date(record.startTime),
        endTime: new Date(record.endTime)
      }))
      setPomodoroHistory(parsedHistory)
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('pomodoro-history', JSON.stringify(pomodoroHistory))
  }, [pomodoroHistory])

  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings))
  }, [settings])

  // Manejar completado de pomodoro con historial
  const handleTimerComplete = (currentSessionStart: Date | null) => {
    const endTime = new Date()
    const activeTask = tasks.find(task => task.id === activeTaskId)
    
    const record: PomodoroRecord = {
      id: Date.now().toString(),
      taskId: activeTaskId,
      taskTitle: activeTask?.title || 'Sin tarea asignada',
      startTime: currentSessionStart || new Date(endTime.getTime() - (mode === 'work' ? settings.workTime : mode === 'shortBreak' ? settings.shortBreak : settings.longBreak) * 60 * 1000),
      endTime,
      mode,
      completed: true
    }
    
    setPomodoroHistory(prev => [...prev, record])
    originalHandleTimerComplete()
  }

  const activeTask = tasks.find(task => task.id === activeTaskId)
  const pendingTasks = tasks.filter(task => !task.completed).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
  const completedTasks = tasks.filter(task => task.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Pomodoro Focus Pro
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Organiza, prioriza y analiza tu productividad
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="pomodoro" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mx-auto">
            <TabsTrigger value="pomodoro" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Pomodoro & Tareas
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pomodoro">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Panel del Pomodoro */}
              <div className="lg:col-span-2">
                <PomodoroTimer
                  timeLeft={timeLeft}
                  isRunning={isRunning}
                  mode={mode}
                  settings={settings}
                  activeTask={activeTask}
                  completedPomodoros={completedPomodoros}
                  completedTasks={completedTasks}
                  todayStats={statsCalculator.getStatsForPeriod(1)}
                  onToggleTimer={toggleTimer}
                  onResetTimer={resetTimer}
                  onSwitchMode={switchMode}
                  onUpdateSettings={setSettings}
                  onTimerComplete={handleTimerComplete}
                />
              </div>

              {/* Panel de Tareas */}
              <div className="lg:col-span-3">
                <TaskList
                  pendingTasks={pendingTasks}
                  completedTasks={completedTasks}
                  activeTaskId={activeTaskId}
                  onAddTask={addTask}
                  onUpdateTask={updateTask}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onSelectActiveTask={selectActiveTask}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <StatsPanel 
              pomodoroHistory={pomodoroHistory}
              statsCalculator={statsCalculator}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
