import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Check, Clock, Calendar, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import PriorityBadge from './PriorityBadge'
import type { Task } from '../types'

interface TaskItemProps {
  task: Task
  isActive: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onSelect: (id: string) => void
  onEdit: (task: Task) => void
  dueDateStatus: string | null
}

export default function TaskItem({ 
  task, 
  isActive, 
  onToggle, 
  onDelete, 
  onSelect,
  onEdit,
  dueDateStatus
}: TaskItemProps) {
  const getDueDateBadge = () => {
    if (!task.dueDate || task.completed) return null
    
    const badgeProps = {
      overdue: { className: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle, text: "Vencida" },
      today: { className: "bg-orange-100 text-orange-800 border-orange-200", icon: Calendar, text: "Hoy" },
      soon: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Calendar, text: "Próxima" },
      normal: { className: "bg-blue-100 text-blue-800 border-blue-200", icon: Calendar, text: "Programada" }
    }
    
    const props = badgeProps[dueDateStatus as keyof typeof badgeProps]
    if (!props) return null
    
    const Icon = props.icon
    
    return (
      <Badge className={`${props.className} text-xs font-medium`}>
        <Icon className="h-3 w-3 mr-1" />
        {props.text}
      </Badge>
    )
  }

  return (
    <div className={`group p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
      isActive 
        ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-md' 
        : task.completed
        ? 'border-gray-200 bg-gray-50/50 opacity-75'
        : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/30'
    }`}>
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggle(task.id)}
          className={`h-7 w-7 rounded-full border-2 transition-all flex-shrink-0 mt-1 ${
            task.completed 
              ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' 
              : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
          }`}
        >
          {task.completed && <Check className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-start gap-2 flex-1">
              <PriorityBadge priority={task.priority} />
              <h3 className={`font-semibold text-lg leading-tight ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-800'
              }`}>
                {task.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getDueDateBadge()}
              {!task.completed && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(task)}
                    className="rounded-full px-3 py-1 text-xs font-medium hover:bg-blue-50 border-blue-200 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelect(task.id)}
                    className={`rounded-full px-4 py-1 text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-purple-600 hover:bg-purple-700 shadow-md' 
                        : 'hover:bg-purple-50 border-purple-200'
                    }`}
                  >
                    {isActive ? '🎯 Activa' : 'Seleccionar'}
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {task.description && (
            <p className={`text-sm mb-3 leading-relaxed ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {task.pomodorosCompleted > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-purple-600 font-medium">
                    {task.pomodorosCompleted} pomodoros
                  </span>
                </div>
              )}
            </div>
            
            {task.dueDate && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
