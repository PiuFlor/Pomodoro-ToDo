import { useState, useEffect, useRef } from 'react'
import type { PomodoroSettings, TimerMode } from '../types'

export function usePomodoroTimer(settings: PomodoroSettings) {
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>('work')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
  }, [isRunning, timeLeft])

  // Actualizar tiempo cuando cambian las configuraciones
  useEffect(() => {
    if (!isRunning) {
      const newTime = mode === 'work' ? settings.workTime : 
                     mode === 'shortBreak' ? settings.shortBreak : 
                     settings.longBreak
      setTimeLeft(newTime * 60)
    }
  }, [settings, mode, isRunning])

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

  const handleTimerComplete = () => {
    setIsRunning(false)
    
    if (mode === 'work') {
      const newCompletedPomodoros = completedPomodoros + 1
      setCompletedPomodoros(newCompletedPomodoros)
      
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

  return {
    timeLeft,
    isRunning,
    mode,
    completedPomodoros,
    currentSessionStart,
    toggleTimer,
    resetTimer,
    switchMode,
    handleTimerComplete
  }
}
