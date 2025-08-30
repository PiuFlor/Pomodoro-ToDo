// app/hooks/useStatsCalculator.ts
import { useMemo } from 'react'
import type { PomodoroRecord } from '../types'

export function useStatsCalculator(pomodoroHistory: PomodoroRecord[]) {
  // ✅ Convertir todos los endTime de string a Date si es necesario
  const normalizedHistory = useMemo(() => {
    return pomodoroHistory.map(record => ({
      ...record,
      endTime: typeof record.endTime === 'string' ? new Date(record.endTime) : record.endTime,
      startTime: typeof record.startTime === 'string' ? new Date(record.startTime) : record.startTime
    }))
  }, [pomodoroHistory])

  const getStatsForPeriod = (days: number, targetDate?: Date) => {
    const referenceDate = targetDate || new Date()
    const startDate = new Date(referenceDate.getTime() - days * 24 * 60 * 60 * 1000)
    const endDate = targetDate ? new Date(referenceDate.getTime() + 24 * 60 * 60 * 1000) : new Date()
    
    return normalizedHistory.filter(record => 
      record.mode === 'work' && 
      record.completed && 
      record.endTime >= startDate &&
      record.endTime <= endDate
    )
  }

  const getStatsForMonth = (year: number, month: number) => {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)
    
    return normalizedHistory.filter(record => 
      record.mode === 'work' && 
      record.completed && 
      record.endTime >= startDate &&
      record.endTime <= endDate
    )
  }

  const getHourlyStats = (records: PomodoroRecord[]) => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
    
    records.forEach(record => {
      const hour = record.endTime.getHours()
      hourlyData[hour].count++
    })
    
    return hourlyData
  }

  const getDailyStats = (records: PomodoroRecord[]) => {
    const dailyData = Array.from({ length: 7 }, (_, i) => ({ 
      day: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i], 
      count: 0 
    }))
    
    records.forEach(record => {
      const day = record.endTime.getDay()
      dailyData[day].count++
    })
    
    return dailyData
  }

  const getAvailableMonths = () => {
    const months = new Set<string>()
    normalizedHistory.forEach(record => {
      if (record.mode === 'work' && record.completed) {
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
  }

  return {
    getStatsForPeriod,
    getStatsForMonth,
    getHourlyStats,
    getDailyStats,
    getAvailableMonths
  }
}