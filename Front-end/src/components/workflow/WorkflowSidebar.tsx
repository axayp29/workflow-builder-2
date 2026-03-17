import { memo, useState, useCallback } from 'react'
import { Node } from 'reactflow'
import { BoltIcon, FunnelIcon, ArrowsRightLeftIcon, EnvelopeIcon, PlusIcon, XMarkIcon, StopIcon } from '@heroicons/react/24/outline'
import { NodeTypes, TriggerType, ActionType, Operator, LogicalOperator, WorkflowCondition, BranchCase, EmailRecipient, EmailConfiguration } from '@/types/workflow'
import { EventField, EventFieldLabels, EventFieldTypes, EventFieldOptions } from '@/types/event'

interface WorkflowSidebarProps {
  onAddNode: (type: NodeTypes, position: { x: number; y: number }) => void
  selectedNode: Node | null
  onUpdateNode: (updatedNode: Node) => void
}

const nodeTypes = [
  {
    type: NodeTypes.TRIGGER,
    label: 'Add Trigger',
    icon: <BoltIcon className="w-5 h-5" />,
    description: 'Start your workflow with an event trigger'
  },
  {
    type: NodeTypes.CONDITION,
    label: 'Add Condition',
    icon: <FunnelIcon className="w-5 h-5" />,
    description: 'Add filter conditions to your workflow'
  },
  {
    type: NodeTypes.BRANCH,
    label: 'Add Branch',
    icon: <ArrowsRightLeftIcon className="w-5 h-5" />,
    description: 'Create branching logic based on conditions'
  },
  {
    type: NodeTypes.ACTION,
    label: 'Add Action',
    icon: <EnvelopeIcon className="w-5 h-5" />,
    description: 'Add actions to execute in your workflow'
  },
  {
    type: NodeTypes.END,
    label: 'Add End',
    icon: <StopIcon className="w-5 h-5 text-red-500" />,
    description: 'Mark the end of a workflow branch'
  }
]

function WorkflowSidebar({ onAddNode, selectedNode, onUpdateNode }: WorkflowSidebarProps) {
  const [newCondition, setNewCondition] = useState<Partial<WorkflowCondition>>({
    field: '',
    operator: Operator.EQUALS,
    value: '',
    logicalOperator: LogicalOperator.AND
  })

  const [newBranchCase, setNewBranchCase] = useState<Partial<BranchCase>>({
    name: '',
    conditions: [],
    description: ''
  })

  const [newRecipient, setNewRecipient] = useState<Partial<EmailRecipient>>({
    email: '',
    name: '',
    type: 'to'
  })

  const handleDragStart = (event: React.DragEvent, nodeType: NodeTypes) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const addCondition = () => {
    if (!selectedNode || !newCondition.field || !newCondition.value) return

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        conditions: [
          ...(selectedNode.data.conditions || []),
          {
            id: Date.now(),
            field: newCondition.field!,
            operator: newCondition.operator!,
            value: newCondition.value!,
            logicalOperator: newCondition.logicalOperator
          }
        ]
      }
    }
    onUpdateNode(updatedNode)
    setNewCondition({
      field: '',
      operator: Operator.EQUALS,
      value: '',
      logicalOperator: LogicalOperator.AND
    })
  }

  const removeCondition = (conditionId: number) => {
    if (!selectedNode) return

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        conditions: selectedNode.data.conditions.filter((c: WorkflowCondition) => c.id !== conditionId)
      }
    }
    onUpdateNode(updatedNode)
  }

  const updateBranchCondition = (condition: string) => {
    if (!selectedNode) return

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        branch: {
          ...selectedNode.data.branch,
          condition
        }
      }
    }
    onUpdateNode(updatedNode)
  }

  const addBranchCase = () => {
    if (!selectedNode || !newBranchCase.name) return

    // Create a new case with a unique ID for each condition
    const newCase = {
      id: Date.now(),
      name: newBranchCase.name!,
      conditions: newBranchCase.conditions?.map(condition => ({
        ...condition,
        id: Date.now() + Math.random() // Ensure each condition has a unique ID
      })) || [],
      description: newBranchCase.description
    }

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        branch: {
          ...selectedNode.data.branch,
          cases: [
            ...(selectedNode.data.branch.cases || []),
            newCase
          ]
        }
      }
    }
    onUpdateNode(updatedNode)
    setNewBranchCase({
      name: '',
      conditions: [],
      description: ''
    })
  }

  const addBranchCaseCondition = () => {
    if (!selectedNode || !newCondition.field || !newCondition.value) return

    // Create a new condition with a unique ID
    const newConditionWithId = {
      id: Date.now(),
      field: newCondition.field!,
      operator: newCondition.operator!,
      value: newCondition.value!,
      logicalOperator: newCondition.logicalOperator
    }

    setNewBranchCase(prev => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        newConditionWithId
      ]
    }))

    setNewCondition({
      field: '',
      operator: Operator.EQUALS,
      value: '',
      logicalOperator: LogicalOperator.AND
    })
  }

  const removeBranchCase = (caseId: number) => {
    if (!selectedNode) return

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        branch: {
          ...selectedNode.data.branch,
          cases: selectedNode.data.branch.cases.filter((c: BranchCase) => c.id !== caseId)
        }
      }
    }
    onUpdateNode(updatedNode)
  }

  const setDefaultCase = (caseId: number) => {
    if (!selectedNode) return

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        branch: {
          ...selectedNode.data.branch,
          defaultCase: selectedNode.data.branch.cases.find((c: BranchCase) => c.id === caseId)
        }
      }
    }
    onUpdateNode(updatedNode)
  }

  const addEmailRecipient = () => {
    if (!selectedNode || !newRecipient.email) return

    const currentConfig = selectedNode.data.action.configuration as EmailConfiguration
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        action: {
          ...selectedNode.data.action,
          configuration: {
            ...currentConfig,
            recipients: [
              ...(currentConfig.recipients || []),
              {
                id: Date.now(),
                email: newRecipient.email!,
                name: newRecipient.name,
                type: newRecipient.type!
              }
            ]
          }
        }
      }
    }
    onUpdateNode(updatedNode)
    setNewRecipient({
      email: '',
      name: '',
      type: 'to'
    })
  }

  const removeEmailRecipient = (recipientId: number) => {
    if (!selectedNode) return

    const currentConfig = selectedNode.data.action.configuration as EmailConfiguration
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        action: {
          ...selectedNode.data.action,
          configuration: {
            ...currentConfig,
            recipients: currentConfig.recipients.filter(r => r.id !== recipientId)
          }
        }
      }
    }
    onUpdateNode(updatedNode)
  }

  const updateEmailConfig = (field: keyof EmailConfiguration, value: any) => {
    if (!selectedNode) return

    const currentConfig = selectedNode.data.action.configuration as EmailConfiguration
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        action: {
          ...selectedNode.data.action,
          configuration: {
            ...currentConfig,
            [field]: value
          }
        }
      }
    }
    onUpdateNode(updatedNode)
  }

  const removeBranchCaseCondition = useCallback((conditionId: number) => {
    setNewBranchCase(prev => ({
      ...prev,
      conditions: prev.conditions?.filter(c => c.id !== conditionId) || []
    }))
  }, [])

  const renderNodeEditor = () => {
    if (!selectedNode) {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            Select a node to configure its settings
          </p>
        </div>
      )
    }

    switch (selectedNode.type) {
      case NodeTypes.TRIGGER:
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Trigger Settings</h4>
            <select
              className="w-full input"
              value={selectedNode.data.triggerType}
              onChange={(e) => {
                onUpdateNode({
                  ...selectedNode,
                  data: {
                    ...selectedNode.data,
                    triggerType: e.target.value as TriggerType
                  }
                })
              }}
            >
              {Object.values(TriggerType).map((type) => (
                <option key={type} value={type}>
                  {type.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')}
                </option>
              ))}
            </select>
          </div>
        )

      case NodeTypes.CONDITION:
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Filter Conditions</h4>
            
            {/* Existing Conditions */}
            <div className="space-y-2">
              {selectedNode.data.conditions?.map((condition: WorkflowCondition, index: number) => (
                <div key={condition.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                  {index > 0 && (
                    <span className="text-xs font-medium text-gray-500">
                      {condition.logicalOperator}
                    </span>
                  )}
                  <span className="text-sm">{EventFieldLabels[condition.field as EventField]}</span>
                  <span className="text-sm text-gray-500">{condition.operator}</span>
                  <span className="text-sm">{condition.value}</span>
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="ml-auto p-1 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Condition Form */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="input"
                  value={newCondition.field}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, field: e.target.value }))}
                >
                  <option value="">Select Field</option>
                  {Object.entries(EventFieldLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  className="input"
                  value={newCondition.operator}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, operator: e.target.value as Operator }))}
                >
                  {Object.values(Operator).map((op) => (
                    <option key={op} value={op}>
                      {op.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
              {newCondition.field && (
                EventFieldTypes[newCondition.field as EventField] === 'select' ? (
                  <select
                    className="input"
                    value={newCondition.value}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                  >
                    <option value="">Select Value</option>
                    {Object.entries(EventFieldOptions[newCondition.field as EventField]).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : EventFieldTypes[newCondition.field as EventField] === 'date' ? (
                  <input
                    type="date"
                    className="input"
                    value={newCondition.value}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                  />
                ) : (
              <input
                    type={EventFieldTypes[newCondition.field as EventField]}
                className="input"
                placeholder="Value"
                value={newCondition.value}
                onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
              />
                )
              )}
              <select
                className="input"
                value={newCondition.logicalOperator}
                onChange={(e) => setNewCondition(prev => ({ ...prev, logicalOperator: e.target.value as LogicalOperator }))}
              >
                {Object.values(LogicalOperator).map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <button
                onClick={addCondition}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
                disabled={!newCondition.field || !newCondition.value}
              >
                <PlusIcon className="w-4 h-4" />
                Add Condition
              </button>
            </div>
          </div>
        )

      case NodeTypes.BRANCH:
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Branch Settings</h4>
            
            {/* Branch Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Branch Name</label>
              <input
                type="text"
                className="input"
                value={selectedNode.data.branch?.name || ''}
                onChange={(e) => {
                  onUpdateNode({
                    ...selectedNode,
                    data: {
                      ...selectedNode.data,
                      branch: {
                        ...selectedNode.data.branch,
                        name: e.target.value
                      }
                    }
                  })
                }}
              />
            </div>

            {/* Existing Cases */}
            <div className="space-y-4">
                {selectedNode.data.branch?.cases?.map((branchCase: BranchCase) => (
                  <div key={branchCase.id} className="p-3 bg-white rounded border space-y-2">
                    <div className="flex items-center justify-between">
                    <h5 className="font-medium">{branchCase.name}</h5>
                        <button
                          onClick={() => removeBranchCase(branchCase.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>

                    <div className="text-sm text-gray-600">
                      <div className="font-medium">Conditions:</div>
                      {branchCase.conditions && branchCase.conditions.length > 0 ? (
                        <div className="mt-1 space-y-1">
                          {branchCase.conditions.map((condition, index) => (
                            <div key={condition.id} className="flex items-center space-x-2">
                              {index > 0 && (
                                <span className="text-xs font-medium text-gray-400">
                                  {condition.logicalOperator}
                                </span>
                              )}
                            <span className="font-medium">{EventFieldLabels[condition.field as EventField]}</span>
                              <span>{condition.operator}</span>
                              <span className="px-2 py-1 bg-gray-100 rounded">
                                {condition.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-1 text-gray-500 italic">
                          No conditions defined
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Add New Case Form */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Add New Case</label>
              <input
                type="text"
                className="input"
                placeholder="Case Name"
                value={newBranchCase.name}
                onChange={(e) => setNewBranchCase(prev => ({ ...prev, name: e.target.value }))}
              />

              {/* Condition Form */}
              <div className="space-y-2 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="input"
                    value={newCondition.field}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, field: e.target.value }))}
                  >
                    <option value="">Select Field</option>
                    {Object.entries(EventFieldLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="input"
                    value={newCondition.operator}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, operator: e.target.value as Operator }))}
                  >
                    {Object.values(Operator).map((op) => (
                      <option key={op} value={op}>
                        {op.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                {newCondition.field && (
                  EventFieldTypes[newCondition.field as EventField] === 'select' ? (
                    <select
                      className="input"
                      value={newCondition.value}
                      onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                    >
                      <option value="">Select Value</option>
                      {Object.entries(EventFieldOptions[newCondition.field as EventField]).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : EventFieldTypes[newCondition.field as EventField] === 'date' ? (
                    <input
                      type="date"
                      className="input"
                      value={newCondition.value}
                      onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                    />
                  ) : (
                <input
                      type={EventFieldTypes[newCondition.field as EventField]}
                  className="input"
                  placeholder="Value"
                  value={newCondition.value}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                />
                  )
                )}
                <select
                  className="input"
                  value={newCondition.logicalOperator}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, logicalOperator: e.target.value as LogicalOperator }))}
                >
                  {Object.values(LogicalOperator).map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
                <button
                  onClick={addBranchCaseCondition}
                  className="w-full btn btn-secondary flex items-center justify-center gap-2"
                  disabled={!newCondition.field || !newCondition.value}
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Condition
                </button>
              </div>

              {/* Display current conditions for the new case */}
              {newBranchCase.conditions && newBranchCase.conditions.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-sm font-medium text-gray-700">Current Conditions:</div>
                  {newBranchCase.conditions.map((condition, index) => (
                    <div key={condition.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        {index > 0 && (
                          <span className="text-xs font-medium text-gray-400">
                            {condition.logicalOperator}
                          </span>
                        )}
                        <span className="font-medium">{EventFieldLabels[condition.field as EventField]}</span>
                        <span>{condition.operator}</span>
                        <span>{condition.value}</span>
                      </div>
                      <button
                        onClick={() => removeBranchCaseCondition(condition.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={addBranchCase}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
                disabled={!newBranchCase.name || !newBranchCase.conditions?.length}
              >
                <PlusIcon className="w-4 h-4" />
                Add Case
              </button>
            </div>
          </div>
        )

      case NodeTypes.ACTION:
        if (selectedNode.data.action?.type === ActionType.SEND_EMAIL) {
          const config = selectedNode.data.action.configuration as EmailConfiguration
          return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Email Settings</h4>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  className="input"
                  value={config.subject || ''}
                  onChange={(e) => updateEmailConfig('subject', e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Body</label>
                <textarea
                  className="input"
                  rows={4}
                  value={config.body || ''}
                  onChange={(e) => updateEmailConfig('body', e.target.value)}
                  placeholder="Enter email body"
                />
              </div>

              {/* Recipients List */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Recipients</label>
                <div className="space-y-2">
                  {config.recipients?.map((recipient) => (
                    <div key={recipient.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{recipient.name || recipient.email}</div>
                        {recipient.name && (
                          <div className="text-xs text-gray-500">{recipient.email}</div>
                        )}
                        <div className="text-xs text-gray-400">{recipient.type.toUpperCase()}</div>
                      </div>
                      <button
                        onClick={() => removeEmailRecipient(recipient.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Recipient Form */}
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      className="input"
                      placeholder="Name (optional)"
                      value={newRecipient.name}
                      onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <select
                      className="input"
                      value={newRecipient.type}
                      onChange={(e) => setNewRecipient(prev => ({ ...prev, type: e.target.value as 'to' | 'cc' | 'bcc' }))}
                    >
                      <option value="to">To</option>
                      <option value="cc">CC</option>
                      <option value="bcc">BCC</option>
                    </select>
                  </div>
                  <input
                    type="email"
                    className="input"
                    placeholder="Email address"
                    value={newRecipient.email}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <button
                    onClick={addEmailRecipient}
                    className="w-full btn btn-primary flex items-center justify-center gap-2"
                    disabled={!newRecipient.email}
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Recipient
                  </button>
                </div>
              </div>
            </div>
          )
        }
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Action Settings</h4>
            <select
              className="w-full input"
              value={selectedNode.data.action?.type || ActionType.SEND_EMAIL}
              onChange={(e) => {
                onUpdateNode({
                  ...selectedNode,
                  data: {
                    ...selectedNode.data,
                    action: {
                      type: e.target.value as ActionType,
                      configuration: e.target.value === ActionType.SEND_EMAIL 
                        ? { subject: '', body: '', recipients: [] }
                        : {}
                    }
                  }
                })
              }}
            >
              {Object.values(ActionType).map((type) => (
                <option key={type} value={type}>
                  {type.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')}
                </option>
              ))}
            </select>
          </div>
        )

      default:
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              No configuration available for this node type
            </p>
          </div>
        )
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Nodes</h3>
      <div className="space-y-3">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="flex items-start p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
            draggable
            onDragStart={(e) => handleDragStart(e, node.type)}
          >
            <div className="flex-shrink-0 p-2 bg-white rounded-md shadow-sm">
              {node.icon}
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">{node.label}</h4>
              <p className="text-xs text-gray-500">{node.description}</p>
            </div>
          </div>
        ))}
      </div>
      {renderNodeEditor()}
    </div>
  )
}

export default memo(WorkflowSidebar) 