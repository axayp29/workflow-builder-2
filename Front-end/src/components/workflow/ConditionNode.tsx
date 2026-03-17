import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { FunnelIcon } from '@heroicons/react/24/outline'
import BaseNode from './BaseNode'
import { WorkflowCondition, Operator, LogicalOperator } from '@/types/workflow'

interface ConditionNodeData {
  conditions: WorkflowCondition[]
  onDelete?: () => void
}

function ConditionNode(props: NodeProps<ConditionNodeData>) {
  const { data } = props

  const getOperatorSymbol = (operator: Operator): string => {
    switch (operator) {
      case Operator.EQUALS:
        return '='
      case Operator.NOT_EQUALS:
        return '≠'
      case Operator.GREATER_THAN:
        return '>'
      case Operator.LESS_THAN:
        return '<'
      case Operator.GREATER_THAN_EQUALS:
        return '≥'
      case Operator.LESS_THAN_EQUALS:
        return '≤'
      case Operator.CONTAINS:
        return 'contains'
      case Operator.NOT_CONTAINS:
        return 'not contains'
      default:
        return operator
    }
  }

  const renderConditions = () => {
    if (!data.conditions || data.conditions.length === 0) {
      return (
        <div className="mt-2 text-xs text-gray-500 italic">
          No conditions defined. Click to add conditions.
        </div>
      )
    }

    return (
      <div className="mt-2 text-sm text-gray-600">
        {data.conditions.map((condition, index) => (
          <div key={condition.id}>
            {index > 0 && (
              <div className="my-1 text-xs font-medium text-gray-400">
                {condition.logicalOperator === LogicalOperator.AND ? 'AND' : 'OR'}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="font-medium">{condition.field}</span>
              <span>{getOperatorSymbol(condition.operator)}</span>
              <span>{String(condition.value)}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <BaseNode
      title="Filter Conditions"
      icon={<FunnelIcon className="w-5 h-5 text-blue-500" />}
      handles={{ source: true, target: true }}
      onDelete={data.onDelete}
    >
      {renderConditions()}
    </BaseNode>
  )
}

export default memo(ConditionNode) 