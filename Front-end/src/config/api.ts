export const API_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  WORKFLOWS: `${API_BASE_URL}/api/workflows`,
  WORKFLOW: (id: number) => `${API_BASE_URL}/api/workflows/${id}`,
  WORKFLOW_EXECUTION: (workflowId: number) => `${API_BASE_URL}/api/workflows/${workflowId}/execute`,
  WORKFLOW_EXECUTIONS: (workflowId: number) => `${API_BASE_URL}/api/workflows/${workflowId}/executions`,
  WORKFLOW_NODE_EXECUTIONS: (workflowId: number, executionId: number) => 
    `${API_BASE_URL}/api/workflows/${workflowId}/executions/${executionId}/nodes`,
  WORKFLOW_EXECUTION_DETAILS: (workflowId: number, executionId: number) => 
    `${API_BASE_URL}/api/workflows/${workflowId}/executions/${executionId}`,
  WORKFLOW_TOGGLE: (id: number) => `${API_BASE_URL}/api/workflows/${id}/toggle`,
} as const; 