import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { BoltIcon, EnvelopeIcon, BellIcon, CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import BaseNode from './BaseNode'
import { WorkflowAction, ActionType } from '@/types/workflow'

interface ActionNodeData {
  action: WorkflowAction
  onDelete?: () => void
}

function ActionNode(props: NodeProps<ActionNodeData>) {
  const { data } = props

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case ActionType.SEND_EMAIL:
        return <EnvelopeIcon className="w-5 h-5 text-green-500" />
      case ActionType.SEND_NOTIFICATION:
        return <BellIcon className="w-5 h-5 text-blue-500" />
      case ActionType.UPDATE_STATUS:
        return <CheckCircleIcon className="w-5 h-5 text-purple-500" />
      case ActionType.CREATE_TASK:
        return <ClipboardDocumentIcon className="w-5 h-5 text-orange-500" />
      case ActionType.DO_NOTHING:
        return <BoltIcon className="w-5 h-5 text-gray-500" />
      default:
        return <BoltIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getActionTitle = (type: ActionType) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  return (
    <BaseNode
      title={getActionTitle(data.action.type)}
      icon={getActionIcon(data.action.type)}
      handles={{ source: true, target: true }}
      onDelete={data.onDelete}
    >
      {data.action.configuration && Object.entries(data.action.configuration).length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          {Object.entries(data.action.configuration).map(([key, value]) => (
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

export default memo(ActionNode) 