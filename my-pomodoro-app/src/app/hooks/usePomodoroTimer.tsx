import { useState, useEffect, useRef } from 'react'
import type { PomodoroSettings, TimerMode } from '../types'

export function usePomodoroTimer(
  settings: PomodoroSettings,
  onTimerComplete?: (sessionStart: Date | null) => Promise<void>
) {
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>('work')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isCompletingRef = useRef(false)

  // ✅ CORREGIDO: Timer principal
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            handleTimerComplete()
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, timeLeft])

  // ✅ CORREGIDO: Solo resetear cuando cambia el modo o settings
  useEffect(() => {
    if (!isRunning) {
      const expectedTime = mode === 'work' ? settings.workTime * 60 :
                          mode === 'shortBreak' ? settings.shortBreak * 60 : 
                          settings.longBreak * 60
      
      // Solo resetear si estamos en el tiempo completo (no pausado a medio camino)
      if (timeLeft === expectedTime) {
        // No hacer nada, ya está en el tiempo correcto
      }
    }
  }, [settings, mode])

  // ✅ CORREGIDO: Función toggleTimer que solo pausa/reanuda
  const toggleTimer = () => {
    if (!isRunning) {
      // Iniciar timer
      if (mode === 'work' && !currentSessionStart) {
        setCurrentSessionStart(new Date())
      }
      setIsRunning(true)
    } else {
      // Pausar timer - NO modificar timeLeft
      setIsRunning(false)
    }
  }

  // ✅ CORREGIDO: Reset reinicia completamente
  const resetTimer = () => {
    setIsRunning(false)
    setCurrentSessionStart(null)
    const time = mode === 'work' ? settings.workTime :
                mode === 'shortBreak' ? settings.shortBreak : settings.longBreak
    setTimeLeft(time * 60)
  }

  const handleTimerComplete = async () => {
    if (isCompletingRef.current) return
    isCompletingRef.current = true

    const sessionStart = currentSessionStart
    setCurrentSessionStart(null)
    setIsRunning(false)

    setTimeout(async () => {
      try {
        if (onTimerComplete) {
          await onTimerComplete(sessionStart)
        }
        
        playAlarmSound()

        if (mode === 'work') {
          const newCount = completedPomodoros + 1
          const nextMode = newCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak'
          
          setCompletedPomodoros(newCount)
          setMode(nextMode)
          setTimeLeft((nextMode === 'longBreak' ? settings.longBreak : settings.shortBreak) * 60)
        } else {
          setMode('work')
          setTimeLeft(settings.workTime * 60)
        }
      } catch (error) {
        console.error('Error al completar el temporizador:', error)
      } finally {
        isCompletingRef.current = false
      }
    }, 100)
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setIsRunning(false)
    setCurrentSessionStart(null)
    const time = newMode === 'work' ? settings.workTime :
                newMode === 'shortBreak' ? settings.shortBreak : settings.longBreak
    setTimeLeft(time * 60)
  }

  // ✅ Función para saltar descanso
  const skipBreak = () => {
    if (mode === 'shortBreak' || mode === 'longBreak') {
      setIsRunning(false)
      setCurrentSessionStart(null)
      setMode('work')
      setTimeLeft(settings.workTime * 60)
    }
  }

  const playAlarmSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 1)
    } catch (e) { console.warn('Alarma no reproducida', e) }
  }

  return { 
    timeLeft, 
    isRunning, 
    mode, 
    completedPomodoros, 
    toggleTimer, 
    resetTimer, 
    switchMode,
    skipBreak
  }
}