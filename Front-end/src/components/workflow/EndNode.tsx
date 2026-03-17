import { memo } from 'react'
import { NodeProps, Handle, Position } from 'reactflow'
import { StopIcon } from '@heroicons/react/24/outline'
import BaseNode from './BaseNode'

interface EndNodeData {
  label?: string
  onDelete?: () => void
}

function EndNode({ data }: NodeProps<EndNodeData>) {
  return (
    <BaseNode
      title={data?.label || 'End Workflow'}
      icon={<StopIcon className="w-5 h-5 text-red-500" />}
      className="bg-red-50 border-red-200"
      handles={{ source: false, target: true }}
      onDelete={data.onDelete}
    >
      {/* Only input handle since this is an end node */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-red-500"
      />
      <div className="mt-2 text-xs text-gray-500">
        Workflow execution stops here
      </div>
    </BaseNode>
  )
}

export default memo(EndNode) 