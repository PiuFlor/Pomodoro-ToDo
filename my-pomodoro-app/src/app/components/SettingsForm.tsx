import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import type { PomodoroSettings } from '../types'

interface SettingsFormProps {
  settings: PomodoroSettings
  onSave: (settings: PomodoroSettings) => void
}

export default function SettingsForm({ settings, onSave }: SettingsFormProps) {
  const [formSettings, setFormSettings] = useState(settings)

  const handleSave = () => {
    onSave(formSettings)
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="workTime" className="text-sm font-semibold text-gray-700">
          🍅 Tiempo de Trabajo (minutos)
        </Label>
        <Input
          id="workTime"
          type="number"
          value={formSettings.workTime}
          onChange={(e) => setFormSettings({
            ...formSettings,
            workTime: parseInt(e.target.value) || 25
          })}
          min="1"
          max="60"
          className="mt-2 p-3 rounded-xl border-2 focus:border-purple-400"
        />
      </div>
      
      <div>
        <Label htmlFor="shortBreak" className="text-sm font-semibold text-gray-700">
          ☕ Descanso Corto (minutos)
        </Label>
        <Input
          id="shortBreak"
          type="number"
          value={formSettings.shortBreak}
          onChange={(e) => setFormSettings({
            ...formSettings,
            shortBreak: parseInt(e.target.value) || 5
          })}
          min="1"
          max="30"
          className="mt-2 p-3 rounded-xl border-2 focus:border-green-400"
        />
      </div>
      
      <div>
        <Label htmlFor="longBreak" className="text-sm font-semibold text-gray-700">
          🌟 Descanso Largo (minutos)
        </Label>
        <Input
          id="longBreak"
          type="number"
          value={formSettings.longBreak}
          onChange={(e) => setFormSettings({
            ...formSettings,
            longBreak: parseInt(e.target.value) || 15
          })}
          min="1"
          max="60"
          className="mt-2 p-3 rounded-xl border-2 focus:border-blue-400"
        />
      </div>
      
      <div>
        <Label htmlFor="longBreakInterval" className="text-sm font-semibold text-gray-700">
          🔄 Descanso largo cada (pomodoros)
        </Label>
        <Input
          id="longBreakInterval"
          type="number"
          value={formSettings.longBreakInterval}
          onChange={(e) => setFormSettings({
            ...formSettings,
            longBreakInterval: parseInt(e.target.value) || 4
          })}
          min="2"
          max="10"
          className="mt-2 p-3 rounded-xl border-2 focus:border-purple-400"
        />
      </div>
      
      <Button 
        onClick={handleSave} 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        💾 Guardar Configuración
      </Button>
    </div>
  )
}
