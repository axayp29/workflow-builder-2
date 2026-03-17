import { memo } from 'react'
import { NodeProps, Handle, Position } from 'reactflow'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import BaseNode from './BaseNode'
import { WorkflowBranch, WorkflowCondition, Operator, LogicalOperator, BranchCase } from '@/types/workflow'

interface BranchNodeData {
  branch: WorkflowBranch
}

function BranchNode({ data }: NodeProps<BranchNodeData>) {
  // Ensure branch and cases exist with default values
  const branch: WorkflowBranch = {
    name: data?.branch?.name || 'New Branch',
    cases: data?.branch?.cases || [],
    defaultCase: data?.branch?.defaultCase
  }

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

  const renderConditions = (conditions: WorkflowCondition[]) => {
    if (!conditions || conditions.length === 0) {
      return (
        <div className="text-xs text-gray-500 italic">
          No conditions defined
        </div>
      )
    }

    return (
      <div className="text-sm text-gray-600">
        {conditions.map((condition, index) => (
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
      title={branch.name}
      icon={<ArrowsRightLeftIcon className="w-5 h-5" />}
      handles={{ source: false, target: true }}
    >
      {/* Input handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />

      {/* Output handles for each case on the right side */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around">
        {branch.cases.map((branchCase) => (
          <div key={branchCase.id} className="relative flex items-center">
            <Handle
              type="source"
              position={Position.Right}
              id={`case-${branchCase.id}`}
              className="w-3 h-3 !bg-green-500"
            />
            <div className="absolute right-6 whitespace-nowrap text-xs bg-white px-2 py-1 rounded border shadow-sm">
              {branchCase.name}
              {branch.defaultCase?.id === branchCase.id && (
                <span className="ml-1 text-blue-600">(Default)</span>
              )}
            </div>
          </div>
        ))}
        {/* Only show default case handle if it's explicitly set and different from regular cases */}
        {branch.defaultCase && !branch.cases.some(c => c.id === branch.defaultCase?.id) && (
          <div className="relative flex items-center">
            <Handle
              type="source"
              position={Position.Right}
              id="default"
              className="w-3 h-3 !bg-gray-500"
            />
            <div className="absolute right-6 whitespace-nowrap text-xs bg-white px-2 py-1 rounded border shadow-sm">
              Default Case
            </div>
          </div>
        )}
      </div>

      {/* Display cases */}
      <div className="mt-2 space-y-2 pr-16">
        {branch.cases.length === 0 ? (
          <div className="text-xs text-gray-500 italic">
            No cases defined. Click to add cases.
          </div>
        ) : (
          branch.cases.map((branchCase) => (
            <div key={branchCase.id} className="text-xs">
              <div className="font-medium text-gray-700">
                {branchCase.name}
                {branch.defaultCase?.id === branchCase.id && (
                  <span className="ml-1 text-blue-600">(Default)</span>
                )}
              </div>
              {renderConditions(branchCase.conditions)}
              {branchCase.description && (
                <div className="text-gray-500 mt-1">
                  {branchCase.description}
                </div>
              )}
            </div>
          ))
        )}
        {/* Only show default case section if it's explicitly set and different from regular cases */}
        {branch.defaultCase && !branch.cases.some(c => c.id === branch.defaultCase?.id) && (
          <div className="text-xs border-t pt-2 mt-2">
            <div className="font-medium text-gray-700">Default Case</div>
            {renderConditions(branch.defaultCase.conditions)}
            {branch.defaultCase.description && (
              <div className="text-gray-500 mt-1">
                {branch.defaultCase.description}
              </div>
            )}
          </div>
        )}
      </div>
    </BaseNode>
  )
}

export default memo(BranchNode) 