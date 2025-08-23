"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Settings, Plus, Trash2, Check, Clock, Calendar, AlertTriangle, Target, Edit, BarChart3, TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type Priority = 'high' | 'medium' | 'low'

interface Task {
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

interface PomodoroRecord {
  id: string
  taskId: string | null
  taskTitle: string
  startTime: Date
  endTime: Date
  mode: 'work' | 'shortBreak' | 'longBreak'
  completed: boolean
}

interface PomodoroSettings {
  workTime: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak'

export default function PomodoroTodoApp() {
  // Estados para las tareas
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as Priority
  })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)

  // Estados para el historial y estadísticas
  const [pomodoroHistory, setPomodoroHistory] = useState<PomodoroRecord[]>([])
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null)

  // Estados para el Pomodoro
  const [settings, setSettings] = useState<PomodoroSettings>({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4
  })
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>('work')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedTasks = localStorage.getItem('pomodoro-tasks')
    const savedHistory = localStorage.getItem('pomodoro-history')
    const savedSettings = localStorage.getItem('pomodoro-settings')

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: { createdAt: string; updatedAt: string }) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }))
      setTasks(parsedTasks)
    }

    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory).map((record: { startTime: string; endTime: string }) => ({
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
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('pomodoro-history', JSON.stringify(pomodoroHistory))
  }, [pomodoroHistory])

  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings))
  }, [settings])

  // Función para completar el temporizador
  const handleTimerComplete = useCallback(() => {
    setIsRunning(false)
    const endTime = new Date()

    // Crear registro del pomodoro
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

    if (mode === 'work') {
      const newCompletedPomodoros = completedPomodoros + 1
      setCompletedPomodoros(newCompletedPomodoros)

      // Actualizar pomodoros de la tarea activa
      if (activeTaskId) {
        setTasks(tasks.map(task =>
          task.id === activeTaskId
            ? { ...task, pomodorosCompleted: task.pomodorosCompleted + 1, updatedAt: new Date() }
            : task
        ))
      }

      // Determinar el siguiente modo
      const nextMode = newCompletedPomodoros % settings.longBreakInterval === 0
        ? 'longBreak'
        : 'shortBreak'

      setMode(nextMode)
      setTimeLeft((nextMode === 'longBreak' ? settings.longBreak : settings.shortBreak) * 60)
    } else {
      setMode('work')
      setTimeLeft(settings.workTime * 60)
    }

    setCurrentSessionStart(null)
  }, [activeTaskId, tasks, currentSessionStart, mode, settings, completedPomodoros])

  // Efecto para el temporizador
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, handleTimerComplete])

  // Actualizar tiempo cuando cambian las configuraciones
  useEffect(() => {
    if (!isRunning) {
      const newTime = mode === 'work' ? settings.workTime :
        mode === 'shortBreak' ? settings.shortBreak :
          settings.longBreak
      setTimeLeft(newTime * 60)
    }
  }, [settings, mode, isRunning])

  // Funciones para las tareas
  const addTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        dueDate: newTask.dueDate || null,
        priority: newTask.priority,
        completed: false,
        pomodorosCompleted: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setTasks([...tasks, task])
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' })
      setIsAddTaskOpen(false)
    }
  }

  const updateTask = () => {
    if (editingTask && editingTask.title.trim()) {
      setTasks(tasks.map(task =>
        task.id === editingTask.id
          ? { ...editingTask, updatedAt: new Date() }
          : task
      ))
      setEditingTask(null)
      setIsEditTaskOpen(false)
    }
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed, updatedAt: new Date() } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
    if (activeTaskId === id) {
      setActiveTaskId(null)
    }
  }

  const selectActiveTask = (id: string) => {
    setActiveTaskId(activeTaskId === id ? null : id)
  }

  const openEditTask = (task: Task) => {
    setEditingTask({ ...task })
    setIsEditTaskOpen(true)
  }

  // Funciones para el Pomodoro
  const toggleTimer = () => {
    if (!isRunning && mode === 'work') {
      setCurrentSessionStart(new Date())
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setCurrentSessionStart(null)
    const newTime = mode === 'work' ? settings.workTime :
      mode === 'shortBreak' ? settings.shortBreak :
        settings.longBreak
    setTimeLeft(newTime * 60)
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setIsRunning(false)
    setCurrentSessionStart(null)
    const newTime = newMode === 'work' ? settings.workTime :
      newMode === 'shortBreak' ? settings.shortBreak :
        settings.longBreak
    setTimeLeft(newTime * 60)
  }

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings)
    setIsSettingsOpen(false)
  }

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Obtener estado de fecha límite
  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'overdue'
    if (diffDays === 0) return 'today'
    if (diffDays <= 3) return 'soon'
    return 'normal'
  }

  // Funciones para estadísticas
  const getStatsForPeriod = (days: number) => {
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return pomodoroHistory.filter(record =>
      record.mode === 'work' &&
      record.completed &&
      record.endTime >= startDate
    )
  }

  const getHourlyStats = () => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
    pomodoroHistory
      .filter(record => record.mode === 'work' && record.completed)
      .forEach(record => {
        const hour = record.endTime.getHours()
        hourlyData[hour].count++
      })
    return hourlyData
  }

  const getDailyStats = () => {
    const dailyData = Array.from({ length: 7 }, (_, i) => ({
      day: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i],
      count: 0
    }))
    pomodoroHistory
      .filter(record => record.mode === 'work' && record.completed)
      .forEach(record => {
        const day = record.endTime.getDay()
        dailyData[day].count++
      })
    return dailyData
  }

  const activeTask = tasks.find(task => task.id === activeTaskId)
  const pendingTasks = tasks.filter(task => !task.completed).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
  const completedTasks = tasks.filter(task => task.completed)
  const todayStats = getStatsForPeriod(1)
  const weekStats = getStatsForPeriod(7)
  const monthStats = getStatsForPeriod(30)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
      {/* Header mejorado */}
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
                <Card className="lg:sticky lg:top-24 h-fit shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50/50 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold">
                        {mode === 'work' ? (
                          <span className="flex items-center gap-2 text-purple-700">
                            <Target className="h-6 w-6" />
                            Tiempo de Trabajo
                          </span>
                        ) : mode === 'shortBreak' ? (
                          <span className="flex items-center gap-2 text-green-700">
                            ☕ Descanso Corto
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-blue-700">
                            🌟 Descanso Largo
                          </span>
                        )}
                      </CardTitle>
                      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-full shadow-md hover:shadow-lg transition-all">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-center">⚙️ Configuración</DialogTitle>
                          </DialogHeader>
                          <SettingsForm settings={settings} onSave={updateSettings} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Temporizador circular */}
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="w-48 h-48 mx-auto mb-6 relative">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 shadow-inner"></div>
                          <div className="absolute inset-4 rounded-full bg-white shadow-lg flex items-center justify-center">
                            <div className="text-4xl font-mono font-bold text-gray-800">
                              {formatTime(timeLeft)}
                            </div>
                          </div>
                          {/* Indicador de progreso */}
                          <div className="absolute inset-0 rounded-full" style={{
                            background: `conic-gradient(from 0deg, ${
                              mode === 'work' ? '#8b5cf6' : mode === 'shortBreak' ? '#10b981' : '#3b82f6'
                            } ${((mode === 'work' ? settings.workTime : mode === 'shortBreak' ? settings.shortBreak : settings.longBreak) * 60 - timeLeft) / (mode === 'work' ? settings.workTime : mode === 'shortBreak' ? settings.shortBreak : settings.longBreak) / 60 * 360}deg, transparent 0deg)`
                          }}></div>
                        </div>
                      </div>
                      {/* Botones de modo */}
                      <div className="flex justify-center gap-2 mb-8">
                        <Button
                          variant={mode === 'work' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => switchMode('work')}
                          disabled={isRunning}
                          className={`rounded-full px-4 py-2 font-medium transition-all ${
                            mode === 'work'
                              ? 'bg-purple-600 hover:bg-purple-700 shadow-lg'
                              : 'hover:bg-purple-50 border-purple-200'
                          }`}
                        >
                          Trabajo
                        </Button>
                        <Button
                          variant={mode === 'shortBreak' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => switchMode('shortBreak')}
                          disabled={isRunning}
                          className={`rounded-full px-4 py-2 font-medium transition-all ${
                            mode === 'shortBreak'
                              ? 'bg-green-600 hover:bg-green-700 shadow-lg'
                              : 'hover:bg-green-50 border-green-200'
                          }`}
                        >
                          Descanso
                        </Button>
                        <Button
                          variant={mode === 'longBreak' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => switchMode('longBreak')}
                          disabled={isRunning}
                          className={`rounded-full px-4 py-2 font-medium transition-all ${
                            mode === 'longBreak'
                              ? 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                              : 'hover:bg-blue-50 border-blue-200'
                          }`}
                        >
                          Descanso Largo
                        </Button>
                      </div>
                      {/* Controles del temporizador */}
                      <div className="flex justify-center gap-4">
                        <Button
                          onClick={toggleTimer}
                          size="lg"
                          className={`rounded-full px-8 py-4 font-bold text-lg shadow-xl transition-all transform hover:scale-105 ${
                            isRunning
                              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                          }`}
                        >
                          {isRunning ? (
                            <>
                              <Pause className="h-5 w-5 mr-2" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-5 w-5 mr-2" />
                              Iniciar
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={resetTimer}
                          variant="outline"
                          size="lg"
                          className="rounded-full px-6 py-4 font-medium shadow-lg hover:shadow-xl transition-all border-2"
                        >
                          <RotateCcw className="h-5 w-5 mr-2" />
                          Reiniciar
                        </Button>
                      </div>
                    </div>
                    {/* Tarea activa */}
                    {activeTask && (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100 shadow-lg">
                        <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Tarea Activa
                        </h3>
                        <div className="flex items-start gap-3 mb-2">
                          <PriorityBadge priority={activeTask.priority} />
                          <p className="text-purple-700 font-medium text-lg flex-1">{activeTask.title}</p>
                        </div>
                        {activeTask.description && (
                          <p className="text-purple-600 text-sm mb-3">{activeTask.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <span className="text-sm text-purple-600 font-medium">
                              {activeTask.pomodorosCompleted} pomodoros
                            </span>
                          </div>
                          {activeTask.dueDate && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(activeTask.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Estadísticas rápidas */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl shadow-lg">
                      <h3 className="font-bold mb-4 text-center text-gray-800">📊 Resumen de Hoy</h3>
                      <div className="grid grid-cols-2 gap-6 text-center">
                        <div className="bg-white p-4 rounded-xl shadow-md">
                          <div className="text-3xl font-bold text-purple-600 mb-1">{todayStats.length}</div>
                          <div className="text-sm text-gray-600 font-medium">Pomodoros</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-md">
                          <div className="text-3xl font-bold text-green-600 mb-1">{completedTasks.length}</div>
                          <div className="text-sm text-gray-600 font-medium">Tareas</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Panel de Tareas */}
              <div className="lg:col-span-3 space-y-6">
                {/* Botón para agregar tarea */}
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-dashed border-purple-200 hover:border-purple-400 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
                      <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Plus className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                          <p className="text-lg font-semibold text-purple-600">Agregar Nueva Tarea</p>
                          <p className="text-sm text-purple-400">Haz clic para crear una nueva tarea</p>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-center">✨ Nueva Tarea</DialogTitle>
                    </DialogHeader>
                    <TaskForm
                      task={newTask}
                      setTask={setNewTask}
                      onSubmit={addTask}
                      submitText="Crear Tarea"
                    />
                  </DialogContent>
                </Dialog>
                {/* Dialog para editar tarea */}
                <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-center">✏️ Editar Tarea</DialogTitle>
                    </DialogHeader>
                    {editingTask && (
                      <TaskForm
                        task={{
                          title: editingTask.title,
                          description: editingTask.description,
                          dueDate: editingTask.dueDate || '',
                          priority: editingTask.priority
                        }}
                        setTask={(updatedTask) => setEditingTask({
                          ...editingTask,
                          ...updatedTask
                        })}
                        onSubmit={updateTask}
                        submitText="Actualizar Tarea"
                      />
                    )}
                  </DialogContent>
                </Dialog>
                {/* Lista de tareas pendientes */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Target className="h-6 w-6" />
                      Tareas Pendientes ({pendingTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {pendingTasks.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎉</div>
                        <p className="text-xl font-semibold text-gray-600 mb-2">
                          ¡Excelente trabajo!
                        </p>
                        <p className="text-gray-500">No tienes tareas pendientes.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingTasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            isActive={activeTaskId === task.id}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onSelect={selectActiveTask}
                            onEdit={openEditTask}
                            dueDateStatus={getDueDateStatus(task.dueDate)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* Lista de tareas completadas */}
                {completedTasks.length > 0 && (
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Check className="h-6 w-6" />
                        Tareas Completadas ({completedTasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {completedTasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            isActive={false}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onSelect={() => {}}
                            onEdit={openEditTask}
                            dueDateStatus={getDueDateStatus(task.dueDate)}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="stats">
            <StatsPanel
              pomodoroHistory={pomodoroHistory}
              todayStats={todayStats}
              weekStats={weekStats}
              monthStats={monthStats}
              hourlyStats={getHourlyStats()}
              dailyStats={getDailyStats()}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Componente para badge de prioridad
function PriorityBadge({ priority }: { priority: Priority }) {
  const config = {
    high: {
      icon: ArrowUp,
      text: 'Alta',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    medium: {
      icon: Minus,
      text: 'Media',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    low: {
      icon: ArrowDown,
      text: 'Baja',
      className: 'bg-green-100 text-green-800 border-green-200'
    }
  }
  const { icon: Icon, text, className } = config[priority]
  return (
    <Badge className={`${className} text-xs font-medium flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  )
}

// Componente mejorado para cada tarea
function TaskItem({
  task,
  isActive,
  onToggle,
  onDelete,
  onSelect,
  onEdit,
  dueDateStatus
}: {
  task: Task
  isActive: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onSelect: (id: string) => void
  onEdit: (task: Task) => void
  dueDateStatus: string | null
}) {
  const getDueDateBadge = () => {
    if (!task.dueDate || task.completed) return null
    const badgeProps = {
      overdue: { className: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle, text: "Vencida" },
      today: { className: "bg-orange-100 text-orange-800 border-orange-200", icon: Calendar, text: "Hoy" },
      soon: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Calendar, text: "Próxima" },
      normal: { className: "bg-blue-100 text-blue-800 border-blue-200", icon: Calendar, text: "Programada" }
    }
    const props = badgeProps[dueDateStatus as keyof typeof badgeProps]
    if (!props) return null
    const Icon = props.icon
    return (
      <Badge className={`${props.className} text-xs font-medium`}>
        <Icon className="h-3 w-3 mr-1" />
        {props.text}
      </Badge>
    )
  }
  return (
    <div className={`group p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
      isActive
        ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-md'
        : task.completed
        ? 'border-gray-200 bg-gray-50/50 opacity-75'
        : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/30'
    }`}>
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggle(task.id)}
          className={`h-7 w-7 rounded-full border-2 transition-all flex-shrink-0 mt-1 ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
              : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
          }`}
        >
          {task.completed && <Check className="h-4 w-4" />}
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-start gap-2 flex-1">
              <PriorityBadge priority={task.priority} />
              <h3 className={`font-semibold text-lg leading-tight ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-800'
              }`}>
                {task.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getDueDateBadge()}
              {!task.completed && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(task)}
                    className="rounded-full px-3 py-1 text-xs font-medium hover:bg-blue-50 border-blue-200 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelect(task.id)}
                    className={`rounded-full px-4 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600 hover:bg-purple-700 shadow-md'
                        : 'hover:bg-purple-50 border-purple-200'
                    }`}
                  >
                    {isActive ? '🎯 Activa' : 'Seleccionar'}
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {task.description && (
            <p className={`text-sm mb-3 leading-relaxed ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {task.pomodorosCompleted > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-purple-600 font-medium">
                    {task.pomodorosCompleted} pomodoros
                  </span>
                </div>
              )}
            </div>
            {task.dueDate && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para formulario de tarea (agregar/editar)
function TaskForm({
  task,
  setTask,
  onSubmit,
  submitText
}: {
  task: { title: string; description: string; dueDate: string; priority: Priority }
  setTask: (task: { title: string; description: string; dueDate: string; priority: Priority }) => void
  onSubmit: () => void
  submitText: string
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
          Título de la tarea *
        </Label>
        <Input
          id="title"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          placeholder="¿Qué necesitas hacer?"
          className="mt-2 text-lg p-3 rounded-xl border-2 focus:border-purple-400"
          required
        />
      </div>
      <div>
        <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
          Descripción (opcional)
        </Label>
        <Textarea
          id="description"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
          placeholder="Agrega más detalles sobre esta tarea..."
          className="mt-2 p-3 rounded-xl border-2 focus:border-purple-400 min-h-[100px]"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">
          Prioridad
        </Label>
        <Select value={task.priority} onValueChange={(value: Priority) => setTask({ ...task, priority: value })}>
          <SelectTrigger className="mt-2 p-3 rounded-xl border-2 focus:border-purple-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-red-500" />
                <span>Alta Prioridad</span>
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-yellow-500" />
                <span>Prioridad Media</span>
              </div>
            </SelectItem>
            <SelectItem value="low">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-green-500" />
                <span>Baja Prioridad</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="dueDate" className="text-sm font-semibold text-gray-700">
          Fecha límite (opcional)
        </Label>
        <Input
          id="dueDate"
          type="date"
          value={task.dueDate}
          onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
          className="mt-2 p-3 rounded-xl border-2 focus:border-purple-400"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        disabled={!task.title.trim()}
      >
        <Plus className="h-5 w-5 mr-2" />
        {submitText}
      </Button>
    </form>
  )
}

// Componente para configurar el Pomodoro
function SettingsForm({
  settings,
  onSave
}: {
  settings: PomodoroSettings
  onSave: (settings: PomodoroSettings) => void
}) {
  const [formSettings, setFormSettings] = useState(settings)
  const handleSave = () => {
    onSave(formSettings)
  }
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="workTime" className="text-sm font-semibold text-gray-700">
          🍅 Tiempo de Trabajo (minutos)
        </Label>
        <Input
          id="workTime"
          type="number"
          value={formSettings.workTime}
          onChange={(e) => setFormSettings({
            ...formSettings,
            workTime: parseInt(e.target.value) || 25
          })}
          min="1"
          max="60"
          className="mt-2 p-3 rounded-xl border-2 focus:border-purple-400"
        />
      </div>
      <div>
        <Label htmlFor="shortBreak" className="text-sm font-semibold text-gray-700">
          ☕ Descanso Corto (minutos)
        </Label>
        <Input
          id="shortBreak"
          type="number"
          value={formSettings.shortBreak}
          onChange={(e) => setFormSettings({
            ...formSettings,
            shortBreak: parseInt(e.target.value) || 5
          })}
          min="1"
          max="30"
          className="mt-2 p-3 rounded-xl border-2 focus:border-green-400"
        />
      </div>
      <div>
        <Label htmlFor="longBreak" className="text-sm font-semibold text-gray-700">
          🌟 Descanso Largo (minutos)
        </Label>
        <Input
          id="longBreak"
          type="number"
          value={formSettings.longBreak}
          onChange={(e) => setFormSettings({
            ...formSettings,
            longBreak: parseInt(e.target.value) || 15
          })}
          min="1"
          max="60"
          className="mt-2 p-3 rounded-xl border-2 focus:border-blue-400"
        />
      </div>
      <div>
        <Label htmlFor="longBreakInterval" className="text-sm font-semibold text-gray-700">
          🔄 Descanso largo cada (pomodoros)
        </Label>
        <Input
          id="longBreakInterval"
          type="number"
          value={formSettings.longBreakInterval}
          onChange={(e) => setFormSettings({
            ...formSettings,
            longBreakInterval: parseInt(e.target.value) || 4
          })}
          min="2"
          max="10"
          className="mt-2 p-3 rounded-xl border-2 focus:border-purple-400"
        />
      </div>
      <Button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        💾 Guardar Configuración
      </Button>
    </div>
  )
}

// Componente de estadísticas
function StatsPanel({
  pomodoroHistory,
  todayStats,
  weekStats,
  monthStats,
  hourlyStats,
  dailyStats
}: {
  pomodoroHistory: PomodoroRecord[]
  todayStats: PomodoroRecord[]
  weekStats: PomodoroRecord[]
  monthStats: PomodoroRecord[]
  hourlyStats: { hour: number; count: number }[]
  dailyStats: { day: string; count: number }[]
}) {
  const maxHourlyCount = Math.max(...hourlyStats.map(h => h.count), 1)
  const maxDailyCount = Math.max(...dailyStats.map(d => d.count), 1)
  return (
    <div className="space-y-8">
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{todayStats.length}</div>
            <div className="text-lg font-semibold text-blue-800">Hoy</div>
            <div className="text-sm text-blue-600">Pomodoros completados</div>
          </CardContent>
        </Card>
        <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{weekStats.length}</div>
            <div className="text-lg font-semibold text-green-800">Esta Semana</div>
            <div className="text-sm text-green-600">Pomodoros completados</div>
          </CardContent>
        </Card>
        <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{monthStats.length}</div>
            <div className="text-lg font-semibold text-purple-800">Este Mes</div>
            <div className="text-sm text-purple-600">Pomodoros completados</div>
          </CardContent>
        </Card>
      </div>
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Estadísticas por hora */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Productividad por Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hourlyStats.map((stat) => (
                <div key={stat.hour} className="flex items-center gap-3">
                  <div className="w-12 text-sm text-gray-600">
                    {stat.hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(stat.count / maxHourlyCount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-sm font-medium text-gray-700">
                    {stat.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Estadísticas por día de la semana */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Productividad por Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyStats.map((stat) => (
                <div key={stat.day} className="flex items-center gap-3">
                  <div className="w-12 text-sm text-gray-600 font-medium">
                    {stat.day}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(stat.count / maxDailyCount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-sm font-bold text-gray-700">
                    {stat.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Historial reciente */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historial Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pomodoroHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay registros de pomodoros aún
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pomodoroHistory
                .filter(record => record.mode === 'work' && record.completed)
                .slice(-20)
                .reverse()
                .map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{record.taskTitle}</div>
                      <div className="text-sm text-gray-600">
                        {record.endTime.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      25 min
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}