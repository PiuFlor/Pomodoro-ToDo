// app/components/StatsPanel.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Badge } from "@/app/components/ui/badge"
import { Clock, Calendar, TrendingUp } from 'lucide-react'
import type { PomodoroRecord } from '../types'

interface StatsPanelProps {
  pomodoroHistory: PomodoroRecord[]
  statsCalculator: {
    getStatsForPeriod: (days: number, targetDate?: Date) => PomodoroRecord[]
    getStatsForMonth: (year: number, month: number) => PomodoroRecord[]
    getHourlyStats: (records: PomodoroRecord[]) => { hour: number; count: number }[]
    getDailyStats: (records: PomodoroRecord[]) => { day: string; count: number }[]
    getAvailableMonths: () => { year: number; month: number }[]
  }
}

export default function StatsPanel({ pomodoroHistory, statsCalculator }: StatsPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current')
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  const availableMonths = statsCalculator.getAvailableMonths()
  
  // Configurar el período seleccionado
  const getCurrentStats = () => {
    if (selectedPeriod === 'current') {
      return {
        today: statsCalculator.getStatsForPeriod(1),
        week: statsCalculator.getStatsForPeriod(7),
        month: statsCalculator.getStatsForPeriod(30)
      }
    } else if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number)
      const monthStats = statsCalculator.getStatsForMonth(year, month)
      return {
        today: monthStats,
        week: monthStats,
        month: monthStats
      }
    }
    return {
      today: [],
      week: [],
      month: []
    }
  }

  const currentStats = getCurrentStats()
  const displayStats = selectedPeriod === 'current' ? currentStats.month : currentStats.today
  const hourlyStats = statsCalculator.getHourlyStats(displayStats)
  const dailyStats = statsCalculator.getDailyStats(displayStats)

  const maxHourlyCount = Math.max(...hourlyStats.map(h => h.count), 1)
  const maxDailyCount = Math.max(...dailyStats.map(d => d.count), 1)

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[month]
  }

  return (
    <div className="space-y-8">
      {/* Selector de período */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Análisis
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Tipo de Período
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Período Actual</SelectItem>
                  <SelectItem value="historical">Histórico por Mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedPeriod === 'historical' && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Seleccionar Mes
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="rounded-xl border-2">
                    <SelectValue placeholder="Selecciona un mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(({ year, month }) => (
                      <SelectItem key={`${year}-${month}`} value={`${year}-${month}`}>
                        {getMonthName(month)} {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {selectedPeriod === 'current' ? currentStats.today.length : displayStats.length}
            </div>
            <div className="text-lg font-semibold text-blue-800">
              {selectedPeriod === 'current' ? 'Hoy' : 'Total del Mes'}
            </div>
            <div className="text-sm text-blue-600">Pomodoros completados</div>
          </CardContent>
        </Card>
        
        {selectedPeriod === 'current' && (
          <>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{currentStats.week.length}</div>
                <div className="text-lg font-semibold text-green-800">Esta Semana</div>
                <div className="text-sm text-green-600">Pomodoros completados</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{currentStats.month.length}</div>
                <div className="text-lg font-semibold text-purple-800">Este Mes</div>
                <div className="text-sm text-purple-600">Pomodoros completados</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Estadísticas por hora */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Productividad por Hora
              {selectedPeriod === 'historical' && selectedMonth && (
                <Badge variant="outline" className="ml-2">
                  {getMonthName(parseInt(selectedMonth.split('-')[1]))} {selectedMonth.split('-')[0]}
                </Badge>
              )}
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
              {selectedPeriod === 'historical' && selectedMonth && (
                <Badge variant="outline" className="ml-2">
                  {getMonthName(parseInt(selectedMonth.split('-')[1]))} {selectedMonth.split('-')[0]}
                </Badge>
              )}
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
            Historial {selectedPeriod === 'historical' && selectedMonth ? 
              `- ${getMonthName(parseInt(selectedMonth.split('-')[1]))} ${selectedMonth.split('-')[0]}` : 
              'Reciente'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedPeriod === 'historical' ? 
                'No hay registros para el mes seleccionado' : 
                'No hay registros de pomodoros aún'
              }
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {displayStats
                .slice(-20)
                .reverse()
                .map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{record.taskTitle}</div>
                      <div className="text-sm text-gray-600">
                        {/* ✅ Convertir a Date si es necesario */}
                        {new Date(record.endTime).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: selectedPeriod === 'historical' ? 'numeric' : undefined,
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