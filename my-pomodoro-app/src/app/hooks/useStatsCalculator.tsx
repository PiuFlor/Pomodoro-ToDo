// app/hooks/useStatsCalculator.tsx
import { useMemo, useCallback } from 'react'
import { format } from 'date-fns-tz'
import type { PomodoroRecord } from '../types'

export function useStatsCalculator(pomodoroHistory: PomodoroRecord[]) {
  const timeZone = 'America/Argentina/Buenos_Aires'

  // ✅ Usar useCallback para funciones estables
  const utcToArgentinaTime = useCallback((date: Date): Date => {
    if (date.toString().includes('-03') || date.toString().includes('ART')) {
      return date
    }
    const argentinaOffset = -3 * 60 * 60 * 1000
    return new Date(date.getTime() + argentinaOffset)
  }, [])

  const formatArgentinaDate = useCallback((date: Date): string => {
    return format(date, 'dd/MM/yyyy', { timeZone })
  }, [timeZone])

  const formatArgentinaDateTime = useCallback((date: Date): string => {
    return format(date, 'dd/MM/yyyy HH:mm', { timeZone })
  }, [timeZone])

  const formatArgentinaTime = useCallback((date: Date): string => {
    return format(date, 'HH:mm', { timeZone })
  }, [timeZone])

  // ✅ Memoizar la normalización
  const normalizedHistory = useMemo(() => {
    if (!pomodoroHistory || pomodoroHistory.length === 0) return []
    
    return pomodoroHistory.map(record => {
      try {
        const endTime = record.endTime instanceof Date 
          ? record.endTime 
          : new Date(record.endTime)
          
        const startTime = record.startTime instanceof Date 
          ? record.startTime 
          : new Date(record.startTime)
        
        if (isNaN(endTime.getTime()) || isNaN(startTime.getTime())) {
          return null
        }
        
        const endTimeArg = utcToArgentinaTime(endTime)
        const startTimeArg = utcToArgentinaTime(startTime)
        
        return {
          ...record,
          endTime: endTimeArg,
          startTime: startTimeArg
        }
      } catch (error) {
        console.error('Error processing record:', record, error)
        return null
      }
    }).filter((record): record is PomodoroRecord => record !== null)
  }, [pomodoroHistory, utcToArgentinaTime])

  // ✅ Usar useCallback para todas las funciones
  const getStatsForPeriod = useCallback((days: number, targetDate?: Date) => {
    try {
      const nowInArgentina = utcToArgentinaTime(new Date())
      const referenceDate = targetDate ? utcToArgentinaTime(targetDate) : nowInArgentina
      
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(referenceDate)
      endDate.setHours(23, 59, 59, 999)
      
      const filteredRecords = normalizedHistory.filter(record => 
        record.mode === 'work' && 
        record.completed && 
        record.endTime >= startDate &&
        record.endTime <= endDate
      )
      
      return filteredRecords
    } catch (error) {
      console.error('Error in getStatsForPeriod:', error)
      return []
    }
  }, [normalizedHistory, utcToArgentinaTime])

  const getStatsForMonth = useCallback((year: number, month: number) => {
    try {
      const startDate = new Date(year, month, 1, 0, 0, 0, 0)
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)
      
      const startDateArg = utcToArgentinaTime(startDate)
      const endDateArg = utcToArgentinaTime(endDate)
      
      const filteredRecords = normalizedHistory.filter(record => 
        record.mode === 'work' && 
        record.completed && 
        record.endTime >= startDateArg &&
        record.endTime <= endDateArg
      )
      
      return filteredRecords
    } catch (error) {
      console.error('Error in getStatsForMonth:', error)
      return []
    }
  }, [normalizedHistory, utcToArgentinaTime])

  const getHourlyStats = useCallback((records: PomodoroRecord[]) => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
    
    records.forEach(record => {
      if (record.endTime instanceof Date) {
        const hour = record.endTime.getHours()
        if (hour >= 0 && hour < 24) {
          hourlyData[hour].count++
        }
      }
    })
    
    return hourlyData
  }, [])

  const getDailyStats = useCallback((records: PomodoroRecord[]) => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const dailyData = Array.from({ length: 7 }, (_, i) => ({ 
      day: dayNames[i], 
      count: 0 
    }))
    
    records.forEach(record => {
      if (record.endTime instanceof Date) {
        const day = record.endTime.getDay()
        if (day >= 0 && day < 7) {
          dailyData[day].count++
        }
      }
    })
    
    return dailyData
  }, [])

  const getAvailableMonths = useCallback(() => {
    const months = new Set<string>()
    normalizedHistory.forEach(record => {
      if (record.mode === 'work' && record.completed && record.endTime instanceof Date) {
        const date = record.endTime
        const key = `${date.getFullYear()}-${date.getMonth()}`
        months.add(key)
      }
    })
    
    return Array.from(months).map(key => {
      const [year, month] = key.split('-').map(Number)
      return { year, month }
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
  }, [normalizedHistory])

  return {
    getStatsForPeriod,
    getStatsForMonth,
    getHourlyStats,
    getDailyStats,
    getAvailableMonths,
    formatArgentinaDate,
    formatArgentinaTime,
    formatArgentinaDateTime,
    normalizedHistory
  }
}