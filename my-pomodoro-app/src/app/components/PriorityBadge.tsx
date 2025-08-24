import { Badge } from "@/app/components/ui/badge"
import { ArrowUp, Minus, ArrowDown } from 'lucide-react'
import type { Priority } from '../types'

interface PriorityBadgeProps {
  priority: Priority
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    high: { 
      icon: ArrowUp, 
      text: 'Alta', 
      className: 'bg-red-100 text-red-800 border-red-200' 
    },
    medium: { 
      icon: Minus, 
      text: 'Media', 
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
    },
    low: { 
      icon: ArrowDown, 
      text: 'Baja', 
      className: 'bg-green-100 text-green-800 border-green-200' 
    }
  }
  
  const { icon: Icon, text, className } = config[priority]
  
  return (
    <Badge className={`${className} text-xs font-medium flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  )
}
