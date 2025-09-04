import { useMemo } from 'react'
import type { PomodoroRecord } from '../types'

export function useStatsCalculator(pomodoroHistory: PomodoroRecord[]) {
  // ✅ Normalización mejorada con mejor manejo de fechas
  const normalizedHistory = useMemo(() => {
    if (!pomodoroHistory || pomodoroHistory.length === 0) return []
    
    return pomodoroHistory.map(record => {
      const endTime = record.endTime instanceof Date 
        ? record.endTime 
        : new Date(record.endTime)
        
      const startTime = record.startTime instanceof Date 
        ? record.startTime 
        : new Date(record.startTime)
      
      // Verificar si las fechas son válidas
      if (isNaN(endTime.getTime()) || isNaN(startTime.getTime())) {
        console.warn('Invalid date found in record:', record)
        return null
      }
      
      return {
        ...record,
        endTime,
        startTime
      }
    }).filter((record): record is PomodoroRecord => record !== null)
  }, [pomodoroHistory])

  const getStatsForPeriod = (days: number, targetDate?: Date) => {
    const referenceDate = targetDate || new Date()
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = targetDate 
      ? new Date(referenceDate.getTime() + 24 * 60 * 60 * 1000) 
      : new Date()
    endDate.setHours(23, 59, 59, 999)
    
    return normalizedHistory.filter(record => 
      record.mode === 'work' && 
      record.completed && 
      record.endTime >= startDate &&
      record.endTime <= endDate
    )
  }

  const getStatsForMonth = (year: number, month: number) => {
    const startDate = new Date(year, month, 1, 0, 0, 0, 0)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)
    
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
      if (record.endTime instanceof Date) {
        const hour = record.endTime.getHours()
        if (hour >= 0 && hour < 24) {
          hourlyData[hour].count++
        }
      }
    })
    
    return hourlyData
  }

  const getDailyStats = (records: PomodoroRecord[]) => {
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
  }

  const getAvailableMonths = () => {
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
  }

  // ✅ Stats adicionales para debugging
  const getDebugInfo = () => ({
    totalRecords: pomodoroHistory.length,
    normalizedRecords: normalizedHistory.length,
    workRecords: normalizedHistory.filter(r => r.mode === 'work').length,
    completedWorkRecords: normalizedHistory.filter(r => r.mode === 'work' && r.completed).length
  })

  return {
    getStatsForPeriod,
    getStatsForMonth,
    getHourlyStats,
    getDailyStats,
    getAvailableMonths,
    getDebugInfo,
    // ✅ Exponer datos normalizados para debugging
    normalizedHistory
  }
}