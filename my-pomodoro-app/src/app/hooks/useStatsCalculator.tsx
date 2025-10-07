import { useMemo } from 'react'
import { format } from 'date-fns-tz'
import type { PomodoroRecord } from '../types'

export function useStatsCalculator(pomodoroHistory: PomodoroRecord[]) {
  const timeZone = 'America/Argentina/Buenos_Aires'

  // ✅ Función para convertir fecha UTC a Argentina
  const utcToArgentinaTime = (date: Date): Date => {
    // Si la fecha ya está en Argentina, no hacer conversión
    if (date.toString().includes('-03') || date.toString().includes('ART')) {
      return date
    }
    
    // Convertir de UTC a Argentina (UTC-3)
    const argentinaOffset = -3 * 60 * 60 * 1000 // -3 horas en milisegundos
    return new Date(date.getTime() + argentinaOffset)
  }

  // ✅ Funciones para formatear fechas en zona horaria Argentina
  const formatArgentinaDate = (date: Date): string => {
    return format(date, 'dd/MM/yyyy', { timeZone })
  }

  const formatArgentinaDateTime = (date: Date): string => {
    return format(date, 'dd/MM/yyyy HH:mm', { timeZone })
  }

  const formatArgentinaTime = (date: Date): string => {
    return format(date, 'HH:mm', { timeZone })
  }

  // ✅ Normalización con conversión explícita de UTC a Argentina
  const normalizedHistory = useMemo(() => {
    if (!pomodoroHistory || pomodoroHistory.length === 0) return []
    
    console.log('🕐 DEBUG - Procesando registros con zona horaria Argentina')
    
    return pomodoroHistory.map(record => {
      try {
        const endTime = record.endTime instanceof Date 
          ? record.endTime 
          : new Date(record.endTime)
          
        const startTime = record.startTime instanceof Date 
          ? record.startTime 
          : new Date(record.startTime)
        
        if (isNaN(endTime.getTime()) || isNaN(startTime.getTime())) {
          console.warn('Invalid date found in record:', record)
          return null
        }
        
        // ✅ DEBUG: Ver la diferencia de horas
        console.log('🕐 Record time debug:', {
          originalEndTime: endTime.toString(),
          originalEndTimeISO: endTime.toISOString(),
          convertedEndTime: utcToArgentinaTime(endTime).toString(),
          formattedArgentina: formatArgentinaDateTime(utcToArgentinaTime(endTime))
        })
        
        // Convertir de UTC a hora Argentina
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
  }, [pomodoroHistory])

  const getStatsForPeriod = (days: number, targetDate?: Date) => {
    try {
      // Crear fechas de referencia en Argentina
      const nowInArgentina = utcToArgentinaTime(new Date())
      const referenceDate = targetDate ? utcToArgentinaTime(targetDate) : nowInArgentina
      
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(referenceDate)
      endDate.setHours(23, 59, 59, 999)
      
      console.log(`📊 Stats period (Argentina): ${formatArgentinaDateTime(startDate)} to ${formatArgentinaDateTime(endDate)}`)
      
      const filteredRecords = normalizedHistory.filter(record => 
        record.mode === 'work' && 
        record.completed && 
        record.endTime >= startDate &&
        record.endTime <= endDate
      )
      
      console.log(`📊 Found ${filteredRecords.length} records for period`)
      return filteredRecords
    } catch (error) {
      console.error('Error in getStatsForPeriod:', error)
      return []
    }
  }

  const getStatsForMonth = (year: number, month: number) => {
    try {
      // Crear fechas en zona horaria Argentina
      const startDate = new Date(year, month, 1, 0, 0, 0, 0)
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)
      
      const startDateArg = utcToArgentinaTime(startDate)
      const endDateArg = utcToArgentinaTime(endDate)
      
      console.log(`📅 Month stats (Argentina): ${formatArgentinaDate(startDateArg)} to ${formatArgentinaDate(endDateArg)}`)
      
      const filteredRecords = normalizedHistory.filter(record => 
        record.mode === 'work' && 
        record.completed && 
        record.endTime >= startDateArg &&
        record.endTime <= endDateArg
      )
      
      console.log(`📅 Found ${filteredRecords.length} records for month`)
      return filteredRecords
    } catch (error) {
      console.error('Error in getStatsForMonth:', error)
      return []
    }
  }

  const getHourlyStats = (records: PomodoroRecord[]) => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
    
    records.forEach(record => {
      if (record.endTime instanceof Date) {
        const hour = record.endTime.getHours() // ✅ Ya está en hora Argentina
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
        const day = record.endTime.getDay() // ✅ Ya está en día Argentina
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
        const date = record.endTime // ✅ Ya está en zona horaria Argentina
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
    completedWorkRecords: normalizedHistory.filter(r => r.mode === 'work' && r.completed).length,
    timeZone: timeZone,
    currentTimeInArgentina: formatArgentinaDateTime(utcToArgentinaTime(new Date())),
    sampleRecord: normalizedHistory[0] ? {
      original: pomodoroHistory[0].endTime?.toString(),
      converted: normalizedHistory[0].endTime.toString(),
      formatted: formatArgentinaDateTime(normalizedHistory[0].endTime)
    } : 'No records'
  })

  return {
    getStatsForPeriod,
    getStatsForMonth,
    getHourlyStats,
    getDailyStats,
    getAvailableMonths,
    getDebugInfo,
    // ✅ Nuevas funciones de formato
    formatArgentinaDate,
    formatArgentinaTime,
    formatArgentinaDateTime,
    // ✅ Exponer datos normalizados para debugging
    normalizedHistory
  }
}