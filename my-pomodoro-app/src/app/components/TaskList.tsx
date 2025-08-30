import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"
import { Plus, Target, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import TaskItem from './TaskItem'
import TaskForm from './TaskForm'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task, TaskFormData } from '../types'

interface TaskListProps {
  pendingTasks: Task[]
  completedTasks: Task[]
  activeTaskId: string | null
  onAddTask: (taskData: TaskFormData) => Promise<boolean>  // ← Cambiado a Promise<boolean>
  onUpdateTask: (task: Task) => Promise<boolean>           // ← Cambiado a Promise<boolean>
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
  const [isPendingOpen, setIsPendingOpen] = useState(true)
  const [isCompletedOpen, setIsCompletedOpen] = useState(false)

  const handleAddTask = async () => {
    const success = await onAddTask(newTask);
    if (success) {
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' })
      setIsAddTaskOpen(false)
    }
  }

  const handleUpdateTask = async () => {
    if (editingTask) {
      const success = await onUpdateTask(editingTask);
      if (success) {
        setEditingTask(null)
        setIsEditTaskOpen(false)
      }
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

  const accordionVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center mt-4 mb-2">
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full max-w-md bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Tarea
            </Button>
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
      </div>

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
              setTask={(updated) => setEditingTask({ ...editingTask, ...updated })}
              onSubmit={handleUpdateTask}
              submitText="Actualizar Tarea"
            />
          )}
        </DialogContent>
      </Dialog>

      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white cursor-pointer flex items-center justify-between"
          onClick={() => setIsPendingOpen(!isPendingOpen)}
        >
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Tareas Pendientes ({pendingTasks.length})
          </CardTitle>
          {isPendingOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </CardHeader>
        <AnimatePresence initial={false}>
          {isPendingOpen && (
            <motion.div variants={accordionVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
              <CardContent className="p-6">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">¡No tienes tareas pendientes!</div>
                ) : (
                  <div className="space-y-4">
                    {pendingTasks.map(task => (
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
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {completedTasks.length > 0 && (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-pointer flex items-center justify-between"
            onClick={() => setIsCompletedOpen(!isCompletedOpen)}
          >
            <CardTitle className="flex items-center gap-2">
              <Check className="h-6 w-6" />
              Tareas Completadas ({completedTasks.length})
            </CardTitle>
            {isCompletedOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardHeader>
          <AnimatePresence initial={false}>
            {isCompletedOpen && (
              <motion.div variants={accordionVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {completedTasks.map(task => (
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
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  )
}