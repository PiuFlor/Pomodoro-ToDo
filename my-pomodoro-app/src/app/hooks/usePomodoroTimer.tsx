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

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      handleTimerComplete()
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (!isRunning) {
      const time = mode === 'work' ? settings.workTime :
                  mode === 'shortBreak' ? settings.shortBreak : settings.longBreak
      setTimeLeft(time * 60)
    }
  }, [settings, mode, isRunning])

  const toggleTimer = () => {
    if (!isRunning && mode === 'work') setCurrentSessionStart(new Date())
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setCurrentSessionStart(null)
    const time = mode === 'work' ? settings.workTime :
                mode === 'shortBreak' ? settings.shortBreak : settings.longBreak
    setTimeLeft(time * 60)
  }

  const handleTimerComplete = async () => {
    const sessionStart = currentSessionStart
    setCurrentSessionStart(null)

    // Llamar al callback con await para manejar la promesa
    if (onTimerComplete) {
      try {
        await onTimerComplete(sessionStart)
      } catch (error) {
        console.error('Error al completar el temporizador:', error)
      }
    }

    playAlarmSound()

    if (mode === 'work') {
      const newCount = completedPomodoros + 1
      setCompletedPomodoros(newCount)
      const nextMode = newCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak'
      setMode(nextMode)
      setTimeLeft((nextMode === 'longBreak' ? settings.longBreak : settings.shortBreak) * 60)
    } else {
      setMode('work')
      setTimeLeft(settings.workTime * 60)
    }
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setIsRunning(false)
    setCurrentSessionStart(null)
    const time = newMode === 'work' ? settings.workTime :
                newMode === 'shortBreak' ? settings.shortBreak : settings.longBreak
    setTimeLeft(time * 60)
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

  return { timeLeft, isRunning, mode, completedPomodoros, toggleTimer, resetTimer, switchMode }
}