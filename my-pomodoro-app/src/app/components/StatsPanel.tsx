import { useState, useMemo, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Badge } from "@/app/components/ui/badge"
import { Clock, Calendar, TrendingUp, Target, CheckCircle, AlertTriangle } from 'lucide-react'
import type { PomodoroRecord, Task } from '../types'
import { format } from 'date-fns-tz'

interface StatsPanelProps {
  pomodoroHistory: PomodoroRecord[]
  tasks: Task[]
  statsCalculator: {
    getStatsForPeriod: (days: number, targetDate?: Date) => PomodoroRecord[]
    getStatsForMonth: (year: number, month: number) => PomodoroRecord[]
    getHourlyStats: (records: PomodoroRecord[]) => { hour: number; count: number }[]
    getDailyStats: (records: PomodoroRecord[]) => { day: string; count: number }[]
    getAvailableMonths: () => { year: number; month: number }[]
    
    getTaskStatsForPeriod: (days: number, targetDate?: Date) => Task[]
    getTaskStatsForMonth: (year: number, month: number) => Task[]
    getTaskHourlyStats: (tasks: Task[]) => { hour: number; count: number }[]
    getTaskDailyStats: (tasks: Task[]) => { day: string; count: number }[]
    getTaskPriorityStats: (tasks: Task[]) => { priority: string; count: number; color: string }[]
    getTaskCompletionStats: (tasks: Task[]) => { completed: number; pending: number; total: number }
    getAvailableTaskMonths: () => { year: number; month: number }[]
    
    formatArgentinaDate: (date: Date) => string
    formatArgentinaTime: (date: Date) => string
    formatArgentinaDateTime: (date: Date) => string
  }
}

function StatsPanel({ pomodoroHistory, tasks, statsCalculator }: StatsPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [statsType, setStatsType] = useState<'pomodoro' | 'tasks'>('pomodoro')

  // Memorizar cálculos pesados
  const availableMonths = useMemo(() => 
    statsType === 'pomodoro' 
      ? statsCalculator.getAvailableMonths()
      : statsCalculator.getAvailableTaskMonths(), 
    [statsCalculator, statsType]
  )

  const currentStats = useMemo(() => {
    if (selectedPeriod === 'current') {
      if (statsType === 'pomodoro') {
        return {
          today: statsCalculator.getStatsForPeriod(1),
          week: statsCalculator.getStatsForPeriod(7),
          month: statsCalculator.getStatsForPeriod(30)
        }
      } else {
        return {
          today: statsCalculator.getTaskStatsForPeriod(1),
          week: statsCalculator.getTaskStatsForPeriod(7),
          month: statsCalculator.getTaskStatsForPeriod(30)
        }
      }
    } else if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number)
      if (statsType === 'pomodoro') {
        const monthStats = statsCalculator.getStatsForMonth(year, month)
        return {
          today: monthStats,
          week: monthStats,
          month: monthStats
        }
      } else {
        const monthStats = statsCalculator.getTaskStatsForMonth(year, month)
        return {
          today: monthStats,
          week: monthStats,
          month: monthStats
        }
      }
    }
    return {
      today: [],
      week: [],
      month: []
    }
  }, [selectedPeriod, selectedMonth, statsCalculator, statsType])

  const displayStats = useMemo(() => 
    selectedPeriod === 'current' ? currentStats.month : currentStats.today,
    [selectedPeriod, currentStats]
  )

  const hourlyStats = useMemo(() => 
    statsType === 'pomodoro'
      ? statsCalculator.getHourlyStats(displayStats as PomodoroRecord[])
      : statsCalculator.getTaskHourlyStats(displayStats as Task[]),
    [statsCalculator, displayStats, statsType]
  )

  const dailyStats = useMemo(() => 
    statsType === 'pomodoro'
      ? statsCalculator.getDailyStats(displayStats as PomodoroRecord[])
      : statsCalculator.getTaskDailyStats(displayStats as Task[]),
    [statsCalculator, displayStats, statsType]
  )

  const priorityStats = useMemo(() => 
    statsType === 'tasks' 
      ? statsCalculator.getTaskPriorityStats(displayStats as Task[])
      : [],
    [statsCalculator, displayStats, statsType]
  )

  const completionStats = useMemo(() => 
    statsType === 'tasks' 
      ? statsCalculator.getTaskCompletionStats(displayStats as Task[])
      : { completed: 0, pending: 0, total: 0 },
    [statsCalculator, displayStats, statsType]
  )

  const maxHourlyCount = useMemo(() => 
    Math.max(...hourlyStats.map(h => h.count), 1),
    [hourlyStats]
  )

  const maxDailyCount = useMemo(() => 
    Math.max(...dailyStats.map(d => d.count), 1),
    [dailyStats]
  )

  const maxPriorityCount = useMemo(() => 
    Math.max(...priorityStats.map(p => p.count), 1),
    [priorityStats]
  )

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[month]
  }

  const getStatsTitle = () => {
    return statsType === 'pomodoro' ? 'Pomodoros' : 'Tareas'
  }

  return (
    <div className="space-y-8">
      {/* Selector de tipo de estadísticas y período */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Análisis de {getStatsTitle()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Tipo de Estadísticas
              </label>
              <Select value={statsType} onValueChange={(value: 'pomodoro' | 'tasks') => setStatsType(value)}>
                <SelectTrigger className="rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pomodoro">Pomodoros</SelectItem>
                  <SelectItem value="tasks">Tareas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
            <div className="text-sm text-blue-600">
              {statsType === 'pomodoro' ? 'Pomodoros completados' : 'Tareas creadas'}
            </div>
          </CardContent>
        </Card>
        
        {selectedPeriod === 'current' && (
          <>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{currentStats.week.length}</div>
                <div className="text-lg font-semibold text-green-800">Esta Semana</div>
                <div className="text-sm text-green-600">
                  {statsType === 'pomodoro' ? 'Pomodoros completados' : 'Tareas creadas'}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{currentStats.month.length}</div>
                <div className="text-lg font-semibold text-purple-800">Este Mes</div>
                <div className="text-sm text-purple-600">
                  {statsType === 'pomodoro' ? 'Pomodoros completados' : 'Tareas creadas'}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Estadísticas específicas de tareas */}
      {statsType === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estadísticas de completitud */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Progreso de Tareas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Completadas</span>
                  <span className="text-lg font-bold text-green-600">{completionStats.completed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${completionStats.total > 0 ? (completionStats.completed / completionStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Pendientes</span>
                  <span className="text-lg font-bold text-orange-600">{completionStats.pending}</span>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Total: {completionStats.total} tareas
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas por prioridad */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Distribución por Prioridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorityStats.map((stat) => (
                  <div key={stat.priority} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-gray-600 font-medium">
                      {stat.priority}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className={`bg-gradient-to-r ${stat.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${(stat.count / maxPriorityCount) * 100}%` }}
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
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Estadísticas por hora */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {statsType === 'pomodoro' ? 'Productividad por Hora' : 'Tareas Creadas por Hora'}
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
              {statsType === 'pomodoro' ? 'Productividad por Día' : 'Tareas Creadas por Día'}
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
            Historial {statsType === 'pomodoro' ? 'de Pomodoros' : 'de Tareas'} 
            {selectedPeriod === 'historical' && selectedMonth ? 
              `- ${getMonthName(parseInt(selectedMonth.split('-')[1]))} ${selectedMonth.split('-')[0]}` : 
              ' Reciente'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedPeriod === 'historical' ? 
                `No hay ${statsType === 'pomodoro' ? 'registros' : 'tareas'} para el mes seleccionado` : 
                `No hay ${statsType === 'pomodoro' ? 'registros de pomodoros' : 'tareas'} aún`
              }
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {displayStats
                .slice(-20)
                .reverse()
                .map((record) => (
                  <div key={statsType === 'pomodoro' ? (record as PomodoroRecord).id : (record as Task).id} 
                       className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">
                        {statsType === 'pomodoro' 
                          ? (record as PomodoroRecord).taskTitle 
                          : (record as Task).title
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        {statsType === 'pomodoro' 
                          ? statsCalculator.formatArgentinaDateTime((record as PomodoroRecord).endTime)
                          : `Creada: ${statsCalculator.formatArgentinaDate((record as Task).createdAt)}`
                        }
                      </div>
                    </div>
                    <Badge className={
                      statsType === 'pomodoro' 
                        ? "bg-purple-100 text-purple-800"
                        : (record as Task).completed 
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                    }>
                      {statsType === 'pomodoro' 
                        ? '25 min'
                        : (record as Task).completed ? 'Completada' : 'Pendiente'
                      }
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

export default memo(StatsPanel)