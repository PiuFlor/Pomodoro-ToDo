import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"
import { Plus, Target, Check } from 'lucide-react'
import TaskItem from './TaskItem'
import TaskForm from './TaskForm'
import type { Task, TaskFormData } from '../types'

interface TaskListProps {
  pendingTasks: Task[]
  completedTasks: Task[]
  activeTaskId: string | null
  onAddTask: (taskData: TaskFormData) => boolean
  onUpdateTask: (task: Task) => boolean
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onSelectActiveTask: (id: string) => void
}

export default function TaskList({
  pendingTasks,
  completedTasks,
  activeTaskId,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
  onSelectActiveTask
}: TaskListProps) {
  const [newTask, setNewTask] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)

  const handleAddTask = () => {
    if (onAddTask(newTask)) {
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' })
      setIsAddTaskOpen(false)
    }
  }

  const handleUpdateTask = () => {
    if (editingTask && onUpdateTask(editingTask)) {
      setEditingTask(null)
      setIsEditTaskOpen(false)
    }
  }

  const openEditTask = (task: Task) => {
    setEditingTask({ ...task })
    setIsEditTaskOpen(true)
  }

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null
    
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'overdue'
    if (diffDays === 0) return 'today'
    if (diffDays <= 3) return 'soon'
    return 'normal'
  }

  return (
    <div className="space-y-6">
      {/* Botón para agregar tarea */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-dashed border-purple-200 hover:border-purple-400 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Plus className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <p className="text-lg font-semibold text-purple-600">Agregar Nueva Tarea</p>
                <p className="text-sm text-purple-400">Haz clic para crear una nueva tarea</p>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">✨ Nueva Tarea</DialogTitle>
          </DialogHeader>
          <TaskForm 
            task={newTask}
            setTask={setNewTask}
            onSubmit={handleAddTask}
            submitText="Crear Tarea"
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar tarea */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">✏️ Editar Tarea</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm 
              task={{
                title: editingTask.title,
                description: editingTask.description,
                dueDate: editingTask.dueDate || '',
                priority: editingTask.priority
              }}
              setTask={(updatedTask) => setEditingTask({
                ...editingTask,
                ...updatedTask
              })}
              onSubmit={handleUpdateTask}
              submitText="Actualizar Tarea"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Lista de tareas pendientes */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Tareas Pendientes ({pendingTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pendingTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-xl font-semibold text-gray-600 mb-2">
                ¡Excelente trabajo!
              </p>
              <p className="text-gray-500">No tienes tareas pendientes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isActive={activeTaskId === task.id}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onSelect={onSelectActiveTask}
                  onEdit={openEditTask}
                  dueDateStatus={getDueDateStatus(task.dueDate)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de tareas completadas */}
      {completedTasks.length > 0 && (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Check className="h-6 w-6" />
              Tareas Completadas ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isActive={false}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onSelect={() => {}}
                  onEdit={openEditTask}
                  dueDateStatus={getDueDateStatus(task.dueDate)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
