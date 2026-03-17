import { ReactNode } from 'react'
import { Handle, Position } from 'reactflow'
import { XMarkIcon } from '@heroicons/react/24/outline'

export interface BaseNodeProps {
  title: string
  icon: ReactNode
  children?: ReactNode
  className?: string
  handles?: {
    source?: boolean
    target?: boolean
  }
  onDelete?: () => void
}

export default function BaseNode({ 
  title, 
  icon, 
  children, 
  className = '', 
  handles = { source: false, target: false },
  onDelete 
}: BaseNodeProps) {
  return (
    <div className={`p-4 rounded-lg border bg-white shadow-sm relative ${className}`}>
      {/* Input handle at the top */}
      {handles.target && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-blue-500"
        />
      )}

      {/* Output handle at the bottom */}
      {handles.source && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-green-500"
        />
      )}

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors"
          title="Delete node"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  )
} 