import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"
import { Play, Pause, RotateCcw, Settings, Target, Clock, Calendar } from 'lucide-react'
import SettingsForm from './SettingsForm'
import PriorityBadge from './PriorityBadge'
import type { Task, PomodoroSettings, TimerMode, PomodoroRecord } from '../types'

interface PomodoroTimerProps {
  timeLeft: number
  isRunning: boolean
  mode: TimerMode
  settings: PomodoroSettings
  activeTask: Task | undefined
  completedPomodoros: number
  completedTasks: Task[]
  todayStats: PomodoroRecord[]
  onToggleTimer: () => void
  onResetTimer: () => void
  onSwitchMode: (mode: TimerMode) => void
  onUpdateSettings: (settings: PomodoroSettings) => void
  onTimerComplete: (sessionStart: Date | null) => void
}

export default function PomodoroTimer({
  timeLeft,
  isRunning,
  mode,
  settings,
  activeTask,
  completedPomodoros,
  completedTasks,
  todayStats,
  onToggleTimer,
  onResetTimer,
  onSwitchMode,
  onUpdateSettings,
  onTimerComplete
}: PomodoroTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    const totalTime = mode === 'work' ? settings.workTime : 
                     mode === 'shortBreak' ? settings.shortBreak : 
                     settings.longBreak
    return ((totalTime * 60 - timeLeft) / (totalTime * 60)) * 100
  }

  return (
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full shadow-md hover:shadow-lg transition-all">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-center">⚙️ Configuración</DialogTitle>
              </DialogHeader>
              <SettingsForm settings={settings} onSave={onUpdateSettings} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Temporizador circular con transparencia mejorada */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-48 h-48 mx-auto mb-6 relative">
              {/* Fondo del círculo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 shadow-inner"></div>
              
              {/* Círculo interior blanco */}
              <div className="absolute inset-4 rounded-full bg-white shadow-lg flex items-center justify-center z-10">
                <div className="text-4xl font-mono font-bold text-gray-800">
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              {/* Indicador de progreso con transparencia */}
              <div 
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                  background: `conic-gradient(from 0deg, ${
                    mode === 'work' ? '#8b5cf6' : mode === 'shortBreak' ? '#10b981' : '#3b82f6'
                  } ${getProgressPercentage()}deg, transparent 0deg)`
                }}
              ></div>
            </div>
          </div>
          
          {/* Botones de modo */}
          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant={mode === 'work' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSwitchMode('work')}
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
              onClick={() => onSwitchMode('shortBreak')}
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
              onClick={() => onSwitchMode('longBreak')}
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
              onClick={onToggleTimer}
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
              onClick={onResetTimer} 
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
                  {activeTask.totalPomodoros} pomodoros
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
  )
}
