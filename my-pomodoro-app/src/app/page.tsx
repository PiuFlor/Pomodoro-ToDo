"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Target, BarChart3 } from 'lucide-react'
import PomodoroTimer from './components/PomodoroTimer'
import TaskList from './components/TaskList'
import StatsPanel from './components/StatsPanel'
import MusicPlayer from './components/MusicPlayer'
import { usePomodoroTimer } from './hooks/usePomodoroTimer'
import { useTasksDatabase, usePomodoroRecordsDatabase, useSettingsDatabase } from './hooks/useDatabase'
import { useStatsCalculator } from './hooks/useStatsCalculator'
import { TaskFormData, Task } from './types'

export default function PomodoroTodoApp() {
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask: addTask,
    updateTask,
    toggleTask,
    deleteTask,
    incrementTaskPomodoros
  } = useTasksDatabase()

  const {
    records: pomodoroHistory,
    loading: recordsLoading,
    error: recordsError,
    createRecord
  } = usePomodoroRecordsDatabase()

  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    updateSettings: setSettings
  } = useSettingsDatabase()

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [musicVolume, setMusicVolume] = useState(0.7)
  const [volumeBeforeAlarm, setVolumeBeforeAlarm] = useState(0.7)

  const {
    timeLeft,
    isRunning,
    mode,
    completedPomodoros,
    toggleTimer,
    resetTimer,
    switchMode
  } = usePomodoroTimer(settings, async (currentSessionStart) => {
    const endTime = new Date()
    const activeTask = tasks.find(t => t.id === activeTaskId)

    // Crear registro en la base de datos
    await createRecord({
      taskId: activeTaskId,
      taskTitle: activeTask?.title || 'Sin tarea',
      startTime: currentSessionStart || new Date(endTime.getTime() - (mode === 'work' ? settings.workTime : mode === 'shortBreak' ? settings.shortBreak : settings.longBreak) * 60 * 1000),
      endTime,
      mode,
      completed: true
    })

    // Incrementar pomodoros de la tarea activa si es modo trabajo
    if (mode === 'work' && activeTaskId) {
      await incrementTaskPomodoros(activeTaskId)
    }

    setVolumeBeforeAlarm(musicVolume)
    setMusicVolume(0.1)

    setTimeout(() => {
      setMusicVolume(volumeBeforeAlarm)
    }, 3000)
  })

  const statsCalculator = useStatsCalculator(pomodoroHistory)

  const selectActiveTask = (id: string) => {
    setActiveTaskId(activeTaskId === id ? null : id)
  }

  const activeTask = tasks.find(t => t.id === activeTaskId)
  const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => {
    const order = { high: 3, medium: 2, low: 1 }
    return order[b.priority] - order[a.priority]
  })
  const completedTasks = tasks.filter(t => t.completed)

  // Loading state
  if (tasksLoading || recordsLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (tasksError || recordsError || settingsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error de conexión</h2>
          <p className="text-red-600">
            {tasksError || recordsError || settingsError}
          </p>
        </div>
      </div>
    )
  }

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
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onSelectActiveTask={selectActiveTask}
                  onAddTask={async (taskData) => {
                    try {
                      await addTask(taskData);
                      return true;
                    } catch (error) {
                      console.error('Error adding task:', error);
                      return false;
                    }
                  }}
                  onUpdateTask={async (task) => {
                  try {
                    await updateTask(task.id, { 
                      ...task, 
                      dueDate: task.dueDate ?? "" // Ensure dueDate is a string
                    });
                    return true;
                  } catch (error) {
                    console.error('Error updating task:', error);
                    return false;
                  }
                }}
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