import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  Connection,
  addEdge,
  NodeTypes as ReactFlowNodeTypes,
  EdgeTypes,
  useReactFlow,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import TriggerNode from '@components/workflow/TriggerNode'
import ConditionNode from '@components/workflow/ConditionNode'
import BranchNode from '@components/workflow/BranchNode'
import ActionNode from '@components/workflow/ActionNode'
import EndNode from '@components/workflow/EndNode'
import CustomEdge from '@components/workflow/CustomEdge'
import WorkflowSidebar from '@components/workflow/WorkflowSidebar'
import { TriggerType, NodeTypes, ActionType } from '@/types/workflow'
import { API_ENDPOINTS } from '@/config/api'
import { PlayIcon } from '@heroicons/react/24/outline'
import WorkflowExecutionModal from '@components/workflow/WorkflowExecutionModal'
import WorkflowExecutionHistory from '@components/workflow/WorkflowExecutionHistory'

// Define node types outside the component
const nodeTypes: ReactFlowNodeTypes = {
  [NodeTypes.TRIGGER]: TriggerNode,
  [NodeTypes.CONDITION]: ConditionNode,
  [NodeTypes.BRANCH]: BranchNode,
  [NodeTypes.ACTION]: ActionNode,
  [NodeTypes.END]: EndNode
}

// Define edge types
const edgeTypes: EdgeTypes = {
  custom: CustomEdge
}

const initialNodes: Node[] = [
  {
    id: 'trigger',
    type: NodeTypes.TRIGGER,
    position: { x: 250, y: 0 },
    data: {
      triggerType: TriggerType.EVENT_FORM_SUBMITTED,
      configuration: {}
    },
  },
]

const initialEdges: Edge[] = []

// Update the helper functions
const generateNodeId = (type: string): string => {
  // Get prefix based on node type
  let prefix = '';
  switch (type) {
    case 'TRIGGER':
      prefix = 'TRG';
      break;
    case 'CONDITION':
      prefix = 'CON';
      break;
    case 'BRANCH':
      prefix = 'BRA';
      break;
    case 'ACTION':
      prefix = 'ACT';
      break;
    case 'END':
      prefix = 'END';
      break;
    default:
      prefix = 'NOD';
  }
  
  // Generate a 5-digit random number
  const random = Math.floor(10000 + Math.random() * 90000);
  
  // Combine to create ID (e.g., CON12345)
  return `${prefix}${random}`;
};

const generateEdgeId = (sourceNode: Node, targetNode: Node, handle: string = 'default'): string => {
  // Get source and target prefixes
  const getNodePrefix = (node: Node): string => {
    switch (node.type) {
      case 'TRIGGER':
        return 'TRG';
      case 'CONDITION':
        return 'CON';
      case 'BRANCH':
        return 'BRA';
      case 'ACTION':
        return 'ACT';
      case 'END':
        return 'END';
      default:
        return 'NOD';
    }
  };

  const sourcePrefix = getNodePrefix(sourceNode);
  const targetPrefix = getNodePrefix(targetNode);
  
  // Get handle prefix (for branch cases)
  const handlePrefix = handle.replace('case-', '').toUpperCase().substring(0, 2);
  
  // Generate a 5-digit random number
  const random = Math.floor(10000 + Math.random() * 90000);
  
  // Combine to create ID (e.g., CON_TO_BRA12345)
  return `${sourcePrefix}_TO_${targetPrefix}${handle !== 'default' ? `_${handlePrefix}` : ''}${random}`;
};

export default function WorkflowBuilder() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false)
  const [showExecutionHistory, setShowExecutionHistory] = useState(false)
  const [executionHistoryKey, setExecutionHistoryKey] = useState(0)

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return;

    const newEdge = {
      ...connection,
      id: generateEdgeId(sourceNode, targetNode, connection.sourceHandle || 'default'),
      sourceHandle: connection.sourceHandle || 'default',
      type: 'custom',
      data: { onDelete: onEdgeDelete }
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
  }, [nodes])

  const onEdgeDelete = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId))
  }, [])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return { ...n, position: node.position }
        }
        return n
      })
    )
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Generate initial label based on node type
      const initialLabel = type === 'TRIGGER' ? 'Event Trigger' :
                          type === 'CONDITION' ? 'Filter Conditions' :
                          type === 'BRANCH' ? 'Branch' :
                          type === 'ACTION' ? 'Send Email' :
                          'End Workflow';

      const newNode: Node = {
        id: generateNodeId(type as NodeTypes),
        type: type as NodeTypes,
        position,
        data: {
          ...getInitialNodeData(type as NodeTypes),
          label: initialLabel
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance]
  )

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance)
  }, [])

  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    // Don't allow deleting the trigger node
    const triggerNode = nodes.find(node => node.type === NodeTypes.TRIGGER)
    if (triggerNode && nodesToDelete.some(node => node.id === triggerNode.id)) {
      return
    }

    setNodes((nds) => nds.filter((node) => !nodesToDelete.some((n) => n.id === node.id)))
    setEdges((eds) => eds.filter((edge) => 
      !nodesToDelete.some((node) => 
        edge.source === node.id || edge.target === node.id
      )
    ))
  }, [nodes])

  const getInitialNodeData = (type: NodeTypes) => {
    switch (type) {
      case NodeTypes.TRIGGER:
        return {
          triggerType: TriggerType.EVENT_FORM_SUBMITTED,
          configuration: {}
        }
      case NodeTypes.CONDITION:
        return {
          type: 'condition',
          conditions: [],
          label: 'Filter Conditions'
        }
      case NodeTypes.BRANCH:
        return {
          type: 'branch',
          branch: {
            name: 'New Branch',
            cases: [],
            defaultCase: undefined
          },
          label: 'Branch'
        }
      case NodeTypes.ACTION:
        return {
          type: 'action',
          action: {
            type: ActionType.SEND_EMAIL,
            configuration: {
              subject: '',
              body: '',
              recipients: []
            }
          },
          label: 'Send Email'
        }
      case NodeTypes.END:
        return {
          type: 'end',
          label: 'End Workflow'
        }
      default:
        return {}
    }
  }

  const onUpdateNode = useCallback((updatedNode: Node) => {
    setNodes((nds) =>
      nds.map((n): Node => {
        if (n.id === updatedNode.id) {
          let nodeData = { ...n.data, ...updatedNode.data }
          
          switch (n.type) {
            case NodeTypes.CONDITION:
              nodeData = {
                ...nodeData,
                type: NodeTypes.CONDITION,
                conditions: nodeData.conditions || [],
                label: 'Filter Conditions'
              }
              break
            case NodeTypes.BRANCH:
              nodeData = {
                ...nodeData,
                type: NodeTypes.BRANCH,
                branch: {
                  name: nodeData.branch?.name || 'New Branch',
                  cases: nodeData.branch?.cases || [],
                  defaultCase: nodeData.branch?.defaultCase
                },
                label: 'Branch'
              }
              break
            case NodeTypes.ACTION:
              nodeData = {
                ...nodeData,
                type: NodeTypes.ACTION,
                action: {
                  type: nodeData.action?.type || ActionType.SEND_EMAIL,
                  configuration: nodeData.action?.configuration || {
                    subject: '',
                    body: '',
                    recipients: []
                  }
                },
                label: 'Send Email'
              }
              break
          }
          
          return { ...updatedNode, data: nodeData }
        }
        return n
      })
    )
    setSelectedNode(updatedNode)
  }, [])

  const onAddNode = (type: NodeTypes, position: { x: number; y: number }) => {
    // Generate initial label based on node type
    const typeStr = type.toString();
    const initialLabel = typeStr === 'TRIGGER' ? 'Event Trigger' :
                        typeStr === 'CONDITION' ? 'Filter Conditions' :
                        typeStr === 'BRANCH' ? 'Branch' :
                        typeStr === 'ACTION' ? 'Send Email' :
                        'End Workflow';

    const newNode: Node = {
      id: generateNodeId(typeStr),
      type,
      position,
      data: {
        ...getInitialNodeData(type),
        label: initialLabel
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  }

  // Load workflow data if editing
  useEffect(() => {
    if (id) {
      const fetchWorkflow = async () => {
        try {
          const response = await fetch(API_ENDPOINTS.WORKFLOW(parseInt(id)))
          if (!response.ok) {
            throw new Error('Failed to fetch workflow')
          }
          const workflow = await response.json()

          // Process nodes to ensure branch case IDs are preserved
          const processedNodes = workflow.nodes.map((node: any) => {
            if (node.type === NodeTypes.BRANCH && node.data.branch) {
              // Ensure each case has a unique ID
              const processedBranch = {
                ...node.data.branch,
                cases: node.data.branch.cases.map((branchCase: any) => ({
                  ...branchCase,
                  id: branchCase.id || Date.now() + Math.random()
                }))
              }
              return {
                ...node,
                id: node.nodeId,
                type: node.type,
                position: node.position,
                data: {
                  ...node.data,
                  branch: processedBranch
                }
              }
            }
            return {
              ...node,
              id: node.nodeId,
              type: node.type,
              position: node.position,
              data: node.data
            }
          })

          // Process edges to preserve branch case connections
          const processedEdges = workflow.edges.map((edge: any) => {
            // If the edge is connected to a branch node, ensure we have the correct sourceHandle
            const sourceNode = processedNodes.find((n: Node) => n.id === edge.sourceNodeId)
            if (sourceNode?.type === NodeTypes.BRANCH && edge.sourceHandle) {
              // The sourceHandle should be in the format 'case-{caseId}'
              const caseId = edge.sourceHandle.replace('case-', '')
              const branchCase = sourceNode.data.branch.cases.find((c: any) => c.id.toString() === caseId)
              if (branchCase) {
                return {
                  ...edge,
                  id: edge.edgeId,
                  source: edge.sourceNodeId,
                  target: edge.targetNodeId,
                  sourceHandle: `case-${branchCase.id}`,
                  type: 'custom',
                  label: edge.label,
                  data: { onDelete: onEdgeDelete }
                }
              }
            }
            return {
              ...edge,
              id: edge.edgeId,
              source: edge.sourceNodeId,
              target: edge.targetNodeId,
              type: 'custom',
              label: edge.label,
              data: { onDelete: onEdgeDelete }
            }
          })

          setWorkflowName(workflow.name)
          setWorkflowDescription(workflow.description)
          setNodes(processedNodes)
          setEdges(processedEdges)
        } catch (err) {
          setSaveError(err instanceof Error ? err.message : 'Failed to fetch workflow')
        }
      }
      fetchWorkflow()
    }
  }, [id, onEdgeDelete])

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      setSaveError('Please enter a workflow name')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const workflowData = {
        id: id ? parseInt(id) : undefined,
        name: workflowName,
        description: workflowDescription,
        triggerType: nodes.find(n => n.type === NodeTypes.TRIGGER)?.data.triggerType,
        nodes: nodes.map(node => ({
          nodeId: node.id,
          type: node.type,
          position: node.position,
          data: {
            ...node.data,
            // Ensure branch case IDs are preserved when saving
            branch: node.type === NodeTypes.BRANCH ? {
              ...node.data.branch,
              cases: node.data.branch.cases.map((branchCase: any) => ({
                ...branchCase,
                id: branchCase.id // Preserve the existing ID
              }))
            } : undefined
          }
        })),
        edges: edges.map(edge => ({
          edgeId: edge.id,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          sourceHandle: edge.sourceHandle, // Preserve the source handle for branch cases
          type: edge.type,
          label: edge.label
        }))
      }

      const response = await fetch(id ? API_ENDPOINTS.WORKFLOW(parseInt(id)) : API_ENDPOINTS.WORKFLOWS, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      })

      if (!response.ok) {
        throw new Error('Failed to save workflow')
      }

      const savedWorkflow = await response.json()
      navigate(`/workflow/${savedWorkflow.id}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save workflow')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExecutionStarted = () => {
    setExecutionHistoryKey(prev => prev + 1)
    setShowExecutionHistory(true)
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header with workflow name, save button, and execution button */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
              className="input text-lg font-medium w-full"
            />
            <input
              type="text"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Enter workflow description"
              className="input mt-2 w-full"
            />
          </div>
          <div className="ml-4 flex items-center gap-2">
            {id && (
              <>
                <button
                  onClick={() => setIsExecutionModalOpen(true)}
                  className="btn btn-success flex items-center gap-2"
                >
                  <PlayIcon className="w-5 h-5" />
                  Run Workflow
                </button>
                <button
                  onClick={() => setShowExecutionHistory(!showExecutionHistory)}
                  className="btn btn-secondary"
                >
                  {showExecutionHistory ? 'Hide History' : 'Show History'}
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/workflows')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={saveWorkflow}
              disabled={isSaving}
              className="btn btn-primary flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Workflow'
              )}
            </button>
          </div>
        </div>
        {saveError && (
          <div className="container mx-auto mt-2">
            <p className="text-red-600 text-sm">{saveError}</p>
          </div>
        )}
      </div>

      {/* Workflow builder content */}
      <div className="flex-1 flex">
        <WorkflowSidebar
          onAddNode={onAddNode}
          selectedNode={selectedNode}
          onUpdateNode={onUpdateNode}
        />
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onNodeDragStop={onNodeDragStop}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onInit={onInit}
              onNodesDelete={onNodesDelete}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>

          {/* Execution History */}
          {id && showExecutionHistory && (
            <div className="h-96 border-t bg-gray-50 overflow-y-auto">
              <div className="container mx-auto p-4">
                <WorkflowExecutionHistory
                  key={executionHistoryKey}
                  workflowId={parseInt(id)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Execution Modal */}
      {id && (
        <WorkflowExecutionModal
          workflowId={parseInt(id)}
          isOpen={isExecutionModalOpen}
          onClose={() => setIsExecutionModalOpen(false)}
          onExecutionStarted={handleExecutionStarted}
        />
      )}
    </div>
  )
} 