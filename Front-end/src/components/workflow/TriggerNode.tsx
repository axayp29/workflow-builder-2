import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { BoltIcon } from '@heroicons/react/24/outline'
import BaseNode from './BaseNode'
import { TriggerType } from '@/types/workflow'

interface TriggerNodeData {
  triggerType: TriggerType
  configuration?: Record<string, unknown>
  onDelete?: () => void
}

function TriggerNode(props: NodeProps<TriggerNodeData>) {
  const { data } = props

  const getTriggerTitle = (type: TriggerType) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  return (
    <BaseNode
      title={getTriggerTitle(data.triggerType)}
      icon={<BoltIcon className="w-5 h-5 text-yellow-500" />}
      handles={{ source: true, target: false }}
      onDelete={data.onDelete}
    >
      {data.configuration && Object.entries(data.configuration).length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          {Object.entries(data.configuration).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-medium">{key}:</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </BaseNode>
  )
}

export default memo(TriggerNode) 