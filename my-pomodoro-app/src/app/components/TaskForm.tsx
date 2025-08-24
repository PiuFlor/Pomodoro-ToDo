import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Plus, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import type { TaskFormData, Priority } from '../types'

interface TaskFormProps {
  task: TaskFormData
  setTask: (task: TaskFormData) => void
  onSubmit: () => void
  submitText: string
}

export default function TaskForm({ 
  task, 
  setTask, 
  onSubmit,
  submitText
}: TaskFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
          Título de la tarea *
        </Label>
        <Input
          id="title"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          placeholder="¿Qué necesitas hacer?"
          className="mt-2 text-lg p-3 rounded-xl border-2 focus:border-purple-400"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
          Descripción (opcional)
        </Label>
        <Textarea
          id="description"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
          placeholder="Agrega más detalles sobre esta tarea..."
          className="mt-2 p-3 rounded-xl border-2 focus:border-purple-400 min-h-[100px]"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">
          Prioridad
        </Label>
        <Select value={task.priority} onValueChange={(value: Priority) => setTask({ ...task, priority: value })}>
          <SelectTrigger className="mt-2 p-3 rounded-xl border-2 focus:border-purple-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-red-500" />
                <span>Alta Prioridad</span>
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-yellow-500" />
                <span>Prioridad Media</span>
              </div>
            </SelectItem>
            <SelectItem value="low">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-green-500" />
                <span>Baja Prioridad</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="dueDate" className="text-sm font-semibold text-gray-700">
          Fecha límite (opcional)
        </Label>
        <Input
          id="dueDate"
          type="date"
          value={task.dueDate}
          onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
          className="mt-2 p-3 rounded-xl border-2 focus:border-purple-400"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        disabled={!task.title.trim()}
      >
        <Plus className="h-5 w-5 mr-2" />
        {submitText}
      </Button>
    </form>
  )
}
