package com.workflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.workflow.dto.RunWorkflowRequest;
import com.workflow.dto.WorkflowExecutionDTO;
import com.workflow.dto.WorkflowNodeExecutionDTO;
import com.workflow.entity.Workflow;
import com.workflow.entity.WorkflowExecution;
import com.workflow.entity.WorkflowNode;
import com.workflow.entity.WorkflowNodeExecution;
import com.workflow.enums.NodeType;
import com.workflow.enums.Operator;
import com.workflow.enums.LogicalOperator;
import com.workflow.repository.WorkflowExecutionRepository;
import com.workflow.repository.WorkflowNodeExecutionRepository;
import com.workflow.repository.WorkflowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class WorkflowExecutionService {

    @Autowired
    private WorkflowExecutionRepository workflowExecutionRepository;

    @Autowired
    private WorkflowNodeExecutionRepository workflowNodeExecutionRepository;

    @Autowired
    private WorkflowRepository workflowRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<WorkflowExecutionDTO> getWorkflowExecutions(Long workflowId) {
        // Verify workflow exists
        if (!workflowRepository.existsById(workflowId)) {
            throw new RuntimeException("Workflow not found with id: " + workflowId);
        }
        
        // Get all executions for the workflow, ordered by execution time descending
        return workflowExecutionRepository.findByWorkflowIdOrderByExecutionTimeDesc(workflowId)
            .stream()
            .map(execution -> {
                WorkflowExecutionDTO dto = new WorkflowExecutionDTO();
                dto.setId(execution.getId());
                dto.setExecutionTime(execution.getExecutionTime());
                dto.setCompletedAt(execution.getCompletedAt());
                dto.setExecutionStatus(execution.getExecutionStatus().toString());
                dto.setEventData(execution.getEventData());
                dto.setErrorMessage(execution.getErrorMessage());
                dto.setWorkflowId(execution.getWorkflow().getId());
                dto.setWorkflowName(execution.getWorkflow().getName());
                return dto;
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public Long createExecution(Long workflowId, RunWorkflowRequest request) {
        // Validate request
        request.validate();

        // Get workflow
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        if (!workflow.isActive()) {
            throw new RuntimeException("Workflow is not active");
        }

        // Create execution record
        WorkflowExecution execution = new WorkflowExecution();
        execution.setWorkflow(workflow);
        execution.setExecutionTime(LocalDateTime.now());
        execution.setExecutionStatus(WorkflowExecution.ExecutionStatus.IN_PROGRESS);
        execution.setEventData(request.getEventData());
        execution = workflowExecutionRepository.save(execution);

        try {
            // Get trigger node
            WorkflowNode triggerNode = workflow.getNodes().stream()
                    .filter(node -> node.getType() == NodeType.TRIGGER)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No trigger node found"));

            // Execute workflow starting from trigger node
            AtomicInteger executionOrder = new AtomicInteger(1);
            executeNode(triggerNode, execution, request.getEventData(), new HashSet<>(), executionOrder);

            // Update execution status to completed
            execution.setExecutionStatus(WorkflowExecution.ExecutionStatus.COMPLETED);
            execution.setCompletedAt(LocalDateTime.now());
            workflowExecutionRepository.save(execution);

            return execution.getId();

        } catch (Exception e) {
            // Update execution status to failed
            execution.setExecutionStatus(WorkflowExecution.ExecutionStatus.FAILED);
            execution.setErrorMessage(e.getMessage());
            execution.setCompletedAt(LocalDateTime.now());
            workflowExecutionRepository.save(execution);
            throw new RuntimeException("Workflow execution failed: " + e.getMessage(), e);
        }
    }

    private void executeNode(WorkflowNode node, WorkflowExecution execution, JsonNode eventData, 
                           Set<String> visitedNodes, AtomicInteger executionOrder) {
        if (visitedNodes.contains(node.getNodeId())) {
            throw new RuntimeException("Circular dependency detected in workflow");
        }
        visitedNodes.add(node.getNodeId());

        // Create node execution record
        WorkflowNodeExecution nodeExecution = new WorkflowNodeExecution();
        nodeExecution.setWorkflowExecution(execution);
        nodeExecution.setNodeId(node.getNodeId());
        nodeExecution.setNodeType(node.getType());
        nodeExecution.setExecutionOrder(executionOrder.getAndIncrement());
        nodeExecution.setExecutionTime(LocalDateTime.now());
        nodeExecution.setExecutionStatus(WorkflowNodeExecution.ExecutionStatus.STARTED);
        nodeExecution.setInputData(eventData);
        nodeExecution = workflowNodeExecutionRepository.save(nodeExecution);

        try {
            switch (node.getType()) {
                case TRIGGER:
                    executeNextNodes(node, execution, eventData, visitedNodes, executionOrder);
                    break;

                case CONDITION:
                    boolean conditionResult = evaluateCondition(node, eventData);
                    ObjectNode outputData = objectMapper.createObjectNode();
                    outputData.put("result", conditionResult);
                    nodeExecution.setOutputData(outputData);
                    nodeExecution = workflowNodeExecutionRepository.save(nodeExecution);
                    
                    if (conditionResult) {
                        executeNextNodes(node, execution, eventData, visitedNodes, executionOrder);
                    } else {
                        // If condition is false, proceed to end node
                        System.out.println("Condition evaluation is false, proceeding to end node");
                        executeNextNodes(node, execution, eventData, visitedNodes, executionOrder, "END_NODE");
                    }
                    break;

                case BRANCH:
                    String selectedCaseId = evaluateBranch(node, eventData);
                    ObjectNode branchOutput = objectMapper.createObjectNode();
                    branchOutput.put("selectedCaseId", selectedCaseId);
                    nodeExecution.setOutputData(branchOutput);
                    nodeExecution.setBranchCaseId(selectedCaseId);
                    nodeExecution = workflowNodeExecutionRepository.save(nodeExecution);
                    
                    if (selectedCaseId.equals("END_NODE")) {
                        // If no case matches, proceed to end node
                        System.out.println("No matching case found, proceeding to end node");
                        executeNextNodes(node, execution, eventData, visitedNodes, executionOrder, "END_NODE");
                    } else {
                        executeNextNodes(node, execution, eventData, visitedNodes, executionOrder, selectedCaseId);
                    }
                    break;

                case ACTION:
                    executeAction(node, eventData);
                    executeNextNodes(node, execution, eventData, visitedNodes, executionOrder);
                    break;

                case END:
                    // End node - do nothing
                    break;

                default:
                    throw new RuntimeException("Unknown node type: " + node.getType());
            }

            nodeExecution.setExecutionStatus(WorkflowNodeExecution.ExecutionStatus.COMPLETED);
            workflowNodeExecutionRepository.save(nodeExecution);

        } catch (Exception e) {
            nodeExecution.setExecutionStatus(WorkflowNodeExecution.ExecutionStatus.FAILED);
            nodeExecution.setErrorMessage(e.getMessage());
            workflowNodeExecutionRepository.save(nodeExecution);
            throw e;
        }
    }

    private String normalizeFieldName(String fieldName) {
        // Remove underscores and convert to lowercase for comparison
        return fieldName.replace("_", "").toLowerCase();
    }

    private JsonNode findFieldValue(JsonNode eventData, String field) {
        String normalizedField = normalizeFieldName(field);
        Iterator<String> fieldNames = eventData.fieldNames();
        while (fieldNames.hasNext()) {
            String fieldName = fieldNames.next();
            if (normalizeFieldName(fieldName).equals(normalizedField)) {
                return eventData.get(fieldName);
            }
        }
        return null;
    }

    private boolean evaluateCondition(WorkflowNode node, JsonNode eventData) {
        JsonNode conditions = node.getData().get("conditions");
        if (conditions == null || !conditions.isArray()) {
            throw new RuntimeException("Invalid condition configuration");
        }

        System.out.println("Evaluating condition node with event data: " + eventData.toString());

        boolean result = true;
        String lastOperator = null;

        for (JsonNode condition : conditions) {
            String field = condition.get("field").asText();
            String operator = condition.get("operator").asText();
            String value = condition.get("value").asText();
            String logicalOperator = condition.has("logicalOperator") ? 
                condition.get("logicalOperator").asText() : null;

            JsonNode fieldValue = findFieldValue(eventData, field);
            if (fieldValue == null) {
                System.out.println("Field not found: " + field + " in event data");
                return false;
            }

            boolean conditionResult = evaluateSingleCondition(fieldValue.asText(), operator, value);
            System.out.println("Evaluating condition: " + field + " " + operator + " " + value + " = " + conditionResult);

            if (lastOperator == null) {
                result = conditionResult;
            } else {
                switch (lastOperator) {
                    case "AND":
                        result = result && conditionResult;
                        break;
                    case "OR":
                        result = result || conditionResult;
                        break;
                }
            }

            lastOperator = logicalOperator;
        }

        System.out.println("Final condition result: " + result);
        return result;
    }

    private String evaluateBranch(WorkflowNode node, JsonNode eventData) {
        JsonNode branchConfig = node.getData().get("branch");
        if (branchConfig == null) {
            throw new RuntimeException("Invalid branch configuration");
        }

        JsonNode cases = branchConfig.get("cases");
        if (cases == null || !cases.isArray()) {
            throw new RuntimeException("No cases defined in branch");
        }

        System.out.println("Evaluating branch with event data: " + eventData.toString());

        // Try to find a matching case
        for (JsonNode branchCase : cases) {
            JsonNode conditions = branchCase.get("conditions");
            if (conditions != null && conditions.isArray()) {
                boolean allConditionsMet = true;
                for (JsonNode condition : conditions) {
                    String field = condition.get("field").asText();
                    String operator = condition.get("operator").asText();
                    String value = condition.get("value").asText();

                    JsonNode fieldValue = findFieldValue(eventData, field);
                    if (fieldValue == null) {
                        System.out.println("Field not found: " + field + " in event data");
                        allConditionsMet = false;
                        break;
                    }

                    boolean conditionResult = evaluateSingleCondition(fieldValue.asText(), operator, value);
                    System.out.println("Evaluating condition: " + field + " " + operator + " " + value + " = " + conditionResult);
                    
                    if (!conditionResult) {
                        allConditionsMet = false;
                        break;
                    }
                }

                if (allConditionsMet) {
                    String caseId = branchCase.get("id").asText();
                    String caseName = branchCase.get("name").asText();
                    System.out.println("Found matching case: " + caseName + " (ID: " + caseId + ")");
                    return caseId;
                }
            }
        }

        // If no case matches, check for default case
        JsonNode defaultCase = branchConfig.get("defaultCase");
        if (defaultCase != null) {
            String defaultCaseId = defaultCase.get("id").asText();
            String defaultCaseName = defaultCase.get("name").asText();
            System.out.println("No matching case found, using default case: " + defaultCaseName + " (ID: " + defaultCaseId + ")");
            return defaultCaseId;
        }

        // If no case matches and no default case, go to end node
        System.out.println("No matching case found and no default case, proceeding to end node");
        return "END_NODE";
    }

    private boolean evaluateSingleCondition(String actualValue, String operator, String expectedValue) {
        if (actualValue == null) {
            return false;
        }

        try {
            switch (operator) {
                case "EQUALS":
                    return actualValue.equalsIgnoreCase(expectedValue);
                case "NOT_EQUALS":
                    return !actualValue.equalsIgnoreCase(expectedValue);
                case "GREATER_THAN":
                    return Double.parseDouble(actualValue) > Double.parseDouble(expectedValue);
                case "LESS_THAN":
                    return Double.parseDouble(actualValue) < Double.parseDouble(expectedValue);
                case "GREATER_THAN_EQUALS":
                    return Double.parseDouble(actualValue) >= Double.parseDouble(expectedValue);
                case "LESS_THAN_EQUALS":
                    return Double.parseDouble(actualValue) <= Double.parseDouble(expectedValue);
                case "CONTAINS":
                    return actualValue.toLowerCase().contains(expectedValue.toLowerCase());
                case "NOT_CONTAINS":
                    return !actualValue.toLowerCase().contains(expectedValue.toLowerCase());
                default:
                    throw new RuntimeException("Unsupported operator: " + operator);
            }
        } catch (NumberFormatException e) {
            System.out.println("Error comparing values: " + actualValue + " " + operator + " " + expectedValue);
            return false;
        }
    }

    private void executeAction(WorkflowNode node, JsonNode eventData) {
        JsonNode actionConfig = node.getData().get("action");
        if (actionConfig == null) {
            throw new RuntimeException("Invalid action configuration");
        }

        String actionType = actionConfig.get("type").asText();
        JsonNode configuration = actionConfig.get("configuration");

        switch (actionType) {
            case "SEND_EMAIL":
                if (configuration != null) {
                    String subject = configuration.get("subject").asText();
                    String body = configuration.get("body").asText();
                    JsonNode recipients = configuration.get("recipients");
                    
                    System.out.println("Executing email action:");
                    System.out.println("Subject: " + subject);
                    System.out.println("Body: " + body);
                    System.out.println("Recipients:");
                    
                    if (recipients != null && recipients.isArray()) {
                        for (JsonNode recipient : recipients) {
                            String email = recipient.get("email").asText();
                            String name = recipient.get("name").asText();
                            String type = recipient.get("type").asText();
                            System.out.println("  - " + name + " <" + email + "> (" + type + ")");
                        }
                    }
                }
                break;
                
            default:
                System.out.println("Executing action node: " + node.getNodeId() + " of type: " + actionType);
                break;
        }
    }

    private void executeNextNodes(WorkflowNode node, WorkflowExecution execution, JsonNode eventData, 
                                Set<String> visitedNodes, AtomicInteger executionOrder) {
        executeNextNodes(node, execution, eventData, visitedNodes, executionOrder, null);
    }

    private void executeNextNodes(WorkflowNode node, WorkflowExecution execution, JsonNode eventData, 
                                Set<String> visitedNodes, AtomicInteger executionOrder, String specialCase) {
        execution.getWorkflow().getEdges().stream()
            .filter(edge -> {
                if (specialCase != null) {
                    if (specialCase.equals("END_NODE")) {
                        // For END_NODE, find edges that lead to end nodes
                        return edge.getSourceNodeId().equals(node.getNodeId()) && 
                               execution.getWorkflow().getNodes().stream()
                                   .filter(n -> n.getNodeId().equals(edge.getTargetNodeId()))
                                   .findFirst()
                                   .map(n -> n.getType() == NodeType.END)
                                   .orElse(false);
                    }
                    return edge.getSourceNodeId().equals(node.getNodeId()) && 
                           edge.getSourceHandle().equals("case-" + specialCase);
                }
                
                return edge.getSourceNodeId().equals(node.getNodeId());
            })
            .forEach(edge -> {
                WorkflowNode nextNode = execution.getWorkflow().getNodes().stream()
                    .filter(n -> n.getNodeId().equals(edge.getTargetNodeId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Target node not found"));
                executeNode(nextNode, execution, eventData, new HashSet<>(visitedNodes), executionOrder);
            });
    }

    public List<WorkflowNodeExecutionDTO> getNodeExecutions(Long workflowId, Long executionId) {
        // Verify workflow exists
        if (!workflowRepository.existsById(workflowId)) {
            throw new RuntimeException("Workflow not found with id: " + workflowId);
        }

        // Get the execution and verify it belongs to the workflow
        WorkflowExecution execution = workflowExecutionRepository.findById(executionId)
            .orElseThrow(() -> new RuntimeException("Execution not found with id: " + executionId));

        if (!execution.getWorkflow().getId().equals(workflowId)) {
            throw new RuntimeException("Execution does not belong to the specified workflow");
        }

        // Get node executions and convert to DTOs
        return workflowNodeExecutionRepository.findByWorkflowExecutionIdOrderByExecutionOrderAsc(executionId)
            .stream()
            .map(nodeExecution -> {
                WorkflowNodeExecutionDTO dto = new WorkflowNodeExecutionDTO();
                dto.setId(nodeExecution.getId());
                dto.setNodeId(nodeExecution.getNodeId());
                dto.setNodeType(nodeExecution.getNodeType().toString());
                dto.setExecutionOrder(nodeExecution.getExecutionOrder());
                dto.setExecutionTime(nodeExecution.getExecutionTime());
                dto.setExecutionStatus(nodeExecution.getExecutionStatus().toString());
                dto.setInputData(nodeExecution.getInputData());
                dto.setOutputData(nodeExecution.getOutputData());
                dto.setErrorMessage(nodeExecution.getErrorMessage());
                dto.setParentNodeId(nodeExecution.getParentNodeId());
                dto.setBranchCaseId(nodeExecution.getBranchCaseId());
                dto.setWorkflowExecutionId(nodeExecution.getWorkflowExecution().getId());
                return dto;
            })
            .collect(Collectors.toList());
    }
} 