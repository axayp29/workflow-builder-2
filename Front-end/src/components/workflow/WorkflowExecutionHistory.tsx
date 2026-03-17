import { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { API_ENDPOINTS } from '@/config/api'
import { format, parseISO } from 'date-fns'

interface WorkflowExecution {
  id: number
  executionTime: string
  executionStatus: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  eventData: any
  errorMessage?: string
  completedAt?: string
  nodeExecutions?: WorkflowNodeExecution[]
}

interface WorkflowNodeExecution {
  id: number
  nodeId: string
  nodeType: string
  executionOrder: number
  executionTime: string
  executionStatus: 'STARTED' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  inputData?: any
  outputData?: any
  errorMessage?: string
  parentNodeId?: string
  branchCaseId?: string
  workflowExecutionId: number
}

interface WorkflowExecutionHistoryProps {
  workflowId: number
}

export default function WorkflowExecutionHistory({ workflowId }: WorkflowExecutionHistoryProps) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedExecution, setExpandedExecution] = useState<number | null>(null)
  const [loadingNodeExecutions, setLoadingNodeExecutions] = useState<number | null>(null)

  useEffect(() => {
    fetchExecutions()
  }, [workflowId])

  const fetchExecutions = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.WORKFLOW_EXECUTIONS(workflowId))
      if (!response.ok) {
        throw new Error('Failed to fetch workflow executions')
      }
      const data = await response.json()
      setExecutions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow executions')
    } finally {
      setLoading(false)
    }
  }

  const fetchNodeExecutions = async (executionId: number) => {
    setLoadingNodeExecutions(executionId)
    try {
      const response = await fetch(API_ENDPOINTS.WORKFLOW_NODE_EXECUTIONS(workflowId, executionId))
      if (!response.ok) {
        throw new Error('Failed to fetch node executions')
      }
      const nodeExecutions = await response.json()
      
      // Update the executions state with the fetched node executions
      setExecutions(prevExecutions => 
        prevExecutions.map(execution => 
          execution.id === executionId 
            ? { ...execution, nodeExecutions } 
            : execution
        )
      )
    } catch (err) {
      console.error('Error fetching node executions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch node executions')
    } finally {
      setLoadingNodeExecutions(null)
    }
  }

  const handleExecutionClick = (executionId: number) => {
    if (expandedExecution === executionId) {
      setExpandedExecution(null)
    } else {
      setExpandedExecution(executionId)
      // Fetch node executions if they haven't been loaded yet
      const execution = executions.find(e => e.id === executionId)
      if (execution && !execution.nodeExecutions) {
        fetchNodeExecutions(executionId)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'STARTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'SKIPPED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = parseISO(dateString)
      return format(date, 'MMM d, yyyy HH:mm:ss')
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    )
  }

  if (executions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No executions found for this workflow
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {executions.map((execution) => (
        <div key={execution.id} className="bg-white rounded-lg shadow">
          {/* Execution Header */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            onClick={() => handleExecutionClick(execution.id)}
          >
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.executionStatus)}`}>
                {execution.executionStatus}
              </span>
              <span className="text-sm text-gray-600">
                {formatDateTime(execution.executionTime)}
              </span>
            </div>
            {expandedExecution === execution.id ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {/* Execution Details */}
          {expandedExecution === execution.id && (
            <div className="border-t p-4 space-y-4">
              {/* Event Data */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Event Data</h4>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(execution.eventData, null, 2)}
                </pre>
              </div>

              {/* Node Executions */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Node Executions</h4>
                {loadingNodeExecutions === execution.id ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : execution.nodeExecutions ? (
                  <div className="space-y-2">
                    {execution.nodeExecutions.map((nodeExecution) => (
                      <div
                        key={nodeExecution.id}
                        className="bg-gray-50 rounded p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(nodeExecution.executionStatus)}`}>
                              {nodeExecution.executionStatus}
                            </span>
                            <span className="text-sm font-medium">
                              {nodeExecution.nodeType} ({nodeExecution.nodeId})
                            </span>
                            {nodeExecution.executionOrder && (
                              <span className="text-xs text-gray-500">
                                Order: {nodeExecution.executionOrder}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(nodeExecution.executionTime)}
                          </span>
                        </div>

                        {nodeExecution.errorMessage && (
                          <div className="text-sm text-red-600">
                            Error: {nodeExecution.errorMessage}
                          </div>
                        )}

                        {(nodeExecution.inputData || nodeExecution.outputData) && (
                          <div className="grid grid-cols-2 gap-4">
                            {nodeExecution.inputData && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-500 mb-1">Input</h5>
                                <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(nodeExecution.inputData, null, 2)}
                                </pre>
                              </div>
                            )}
                            {nodeExecution.outputData && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-500 mb-1">Output</h5>
                                <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(nodeExecution.outputData, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        {nodeExecution.branchCaseId && (
                          <div className="text-xs text-gray-500">
                            Branch Case: {nodeExecution.branchCaseId}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No node executions found</div>
                )}
              </div>

              {/* Error Message */}
              {execution.errorMessage && (
                <div className="bg-red-50 p-3 rounded text-sm text-red-600">
                  <h4 className="font-medium mb-1">Execution Error</h4>
                  <p>{execution.errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 