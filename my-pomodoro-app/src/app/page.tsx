"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Target, BarChart3 } from 'lucide-react'
import PomodoroTimer from './components/PomodoroTimer'
import TaskList from './components/TaskList'
import StatsPanel from './components/StatsPanel'
import MusicPlayer from './components/MusicPlayer'
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

  const {
    tasks,
    activeTaskId,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    selectActiveTask
  } = useTaskManager()

  const [musicVolume, setMusicVolume] = useState(0.7)
  const [volumeBeforeAlarm, setVolumeBeforeAlarm] = useState(0.7)

  useEffect(() => {
    const saved = localStorage.getItem('music-volume')
    if (saved) setMusicVolume(parseFloat(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('music-volume', musicVolume.toString())
  }, [musicVolume])

  const {
    timeLeft,
    isRunning,
    mode,
    completedPomodoros,
    toggleTimer,
    resetTimer,
    switchMode
  } = usePomodoroTimer(settings, (currentSessionStart) => {
    const endTime = new Date()
    const activeTask = tasks.find(t => t.id === activeTaskId)

    const record = {
      id: Date.now().toString(),
      taskId: activeTaskId,
      taskTitle: activeTask?.title || 'Sin tarea',
      startTime: currentSessionStart || new Date(endTime.getTime() - (mode === 'work' ? settings.workTime : mode === 'shortBreak' ? settings.shortBreak : settings.longBreak) * 60 * 1000),
      endTime,
      mode,
      completed: true
    }

    setPomodoroHistory(prev => [...prev, record])

    setVolumeBeforeAlarm(musicVolume)
    setMusicVolume(0.1)

    setTimeout(() => {
      setMusicVolume(volumeBeforeAlarm)
    }, 3000)
  })

  const statsCalculator = useStatsCalculator(pomodoroHistory)

  useEffect(() => {
    const savedHistory = localStorage.getItem('pomodoro-history')
    const savedSettings = localStorage.getItem('pomodoro-settings')

    if (savedHistory) {
      const parsed = JSON.parse(savedHistory).map((r: any) => ({
        ...r,
        startTime: new Date(r.startTime),
        endTime: new Date(r.endTime)
      }))
      setPomodoroHistory(parsed)
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pomodoro-history', JSON.stringify(pomodoroHistory))
  }, [pomodoroHistory])

  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings))
  }, [settings])

  const activeTask = tasks.find(t => t.id === activeTaskId)
  const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => {
    const order = { high: 3, medium: 2, low: 1 }
    return order[b.priority] - order[a.priority]
  })
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
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
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/60 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-purple-100">
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
                    onTimerComplete={() => {}}
                  />
                </div>

                <div className="bg-white/60 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-indigo-100">
                  <MusicPlayer
                    isTimerRunning={isRunning}
                    musicVolume={musicVolume}
                    setMusicVolume={setMusicVolume}
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <TaskList
                  pendingTasks={pendingTasks}
                  completedTasks={completedTasks}
                  activeTaskId={activeTaskId}
                  onAddTask={(taskData) => {
                    addTask(taskData)
                    return true
                  }}
                  onUpdateTask={updateTask}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onSelectActiveTask={selectActiveTask}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <StatsPanel pomodoroHistory={pomodoroHistory} statsCalculator={statsCalculator} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}