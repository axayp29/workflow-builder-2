package com.workflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflow.entity.Workflow;
import com.workflow.entity.WorkflowNode;
import com.workflow.entity.WorkflowEdge;
import com.workflow.repository.WorkflowRepository;
import com.workflow.enums.NodeType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkflowService {
    private final WorkflowRepository workflowRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public WorkflowService(WorkflowRepository workflowRepository, ObjectMapper objectMapper) {
        this.workflowRepository = workflowRepository;
        this.objectMapper = objectMapper;
    }

    public List<Workflow> getAllWorkflows() {
        return workflowRepository.findAll();
    }

    public Optional<Workflow> getWorkflowById(Long id) {
        return workflowRepository.findById(id);
    }

    private boolean caseExistsInBranchNode(JsonNode branchNode, String caseId) {
        JsonNode cases = branchNode.get("cases");
        if (cases != null && cases.isArray()) {
            for (JsonNode caseNode : cases) {
                if (caseNode.get("id").asText().equals(caseId)) {
                    return true;
                }
            }
        }
        return false;
    }

    private String generateNodeId(WorkflowNode node) {
        String nodeType = node.getType().toString().toLowerCase();
        String typePrefix = nodeType.substring(0, Math.min(3, nodeType.length()));
        
        // Get meaningful prefix from label or type


        // Generate a 3-char random string
        String random = UUID.randomUUID().toString().substring(0, 3);
        
        // Combine to create 8-10 char ID
        return String.format("%s%s%s", typePrefix, random);
    }

    private void validateNode(WorkflowNode node) {
        if (!StringUtils.hasText(node.getNodeId())) {
            throw new IllegalArgumentException("Node ID is required");
        }
        if (node.getType() == null) {
            throw new IllegalArgumentException("Node type is required");
        }
        if (node.getPositionX() == null || node.getPositionY() == null) {
            throw new IllegalArgumentException("Node position is required");
        }
    }

    @Transactional
    public Workflow createWorkflow(Workflow workflow) {
        validateWorkflow(workflow);
        
        // Process nodes
        for (WorkflowNode node : workflow.getNodes()) {
            validateNode(node);
            processNodeData(node);
            node.setWorkflow(workflow);
        }

        // Process edges
        for (WorkflowEdge edge : workflow.getEdges()) {
            validateEdge(edge);
            // For branch nodes, ensure source handle is properly set
            if (edge.getSourceHandle() == null) {
                WorkflowNode sourceNode = workflow.getNodes().stream()
                    .filter(n -> n.getNodeId().equals(edge.getSourceNodeId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Source node not found"));
                
                if (sourceNode.getType().equals(NodeType.BRANCH)) {
                    // Extract the case ID from the source handle
                    String caseId = edge.getSourceHandle().replace("case-", "");
                    // Verify that this case exists in the branch node
                    JsonNode branchData = sourceNode.getData().get("branch");
                    if (!caseExistsInBranchNode(branchData, caseId)) {
                        throw new IllegalArgumentException("Invalid branch case ID: " + caseId);
                    }
                }
            }
            edge.setWorkflow(workflow);
        }

        return workflowRepository.save(workflow);
    }

    @Transactional
    public Workflow updateWorkflow(Long id, Workflow workflow) {
        validateWorkflow(workflow);
        
        return workflowRepository.findById(id)
                .map(existingWorkflow -> {
                    existingWorkflow.setName(workflow.getName());
                    existingWorkflow.setDescription(workflow.getDescription());
                    existingWorkflow.setTriggerType(workflow.getTriggerType());
                    existingWorkflow.setActive(workflow.isActive());

                    // Create maps of existing nodes and edges for quick lookup
                    Map<String, WorkflowNode> existingNodes = existingWorkflow.getNodes().stream()
                            .collect(Collectors.toMap(WorkflowNode::getNodeId, node -> node));
                    Map<String, WorkflowEdge> existingEdges = existingWorkflow.getEdges().stream()
                            .collect(Collectors.toMap(WorkflowEdge::getEdgeId, edge -> edge));

                    // Clear collections but keep the maps for reference
                    existingWorkflow.getNodes().clear();
                    existingWorkflow.getEdges().clear();

                    // Update or add nodes
                    for (WorkflowNode node : workflow.getNodes()) {
                        validateNode(node);
                        processNodeData(node);
                        
                        // If node exists, update its properties
                        WorkflowNode existingNode = existingNodes.get(node.getNodeId());
                        if (existingNode != null) {
                            existingNode.setType(node.getType());
                        
                            existingNode.setData(node.getData());
                            existingNode.setPositionX(node.getPositionX());
                            existingNode.setPositionY(node.getPositionY());
                            existingNode.setWorkflow(existingWorkflow);
                            existingWorkflow.getNodes().add(existingNode);
                        } else {
                            // For new nodes, add them as is
                            node.setWorkflow(existingWorkflow);
                            existingWorkflow.getNodes().add(node);
                        }
                    }

                    // Update or add edges
                    for (WorkflowEdge edge : workflow.getEdges()) {
                        validateEdge(edge);
                        
                        // If edge exists, update its properties
                        WorkflowEdge existingEdge = existingEdges.get(edge.getEdgeId());
                        if (existingEdge != null) {
                            existingEdge.setSourceNodeId(edge.getSourceNodeId());
                            existingEdge.setSourceHandle(edge.getSourceHandle());
                            existingEdge.setTargetNodeId(edge.getTargetNodeId());
                          
                            existingEdge.setWorkflow(existingWorkflow);
                            existingWorkflow.getEdges().add(existingEdge);
                        } else {
                            // For new edges, verify branch case if needed
                            if (edge.getSourceHandle() != null && edge.getSourceHandle().startsWith("case-")) {
                                WorkflowNode sourceNode = workflow.getNodes().stream()
                                    .filter(n -> n.getNodeId().equals(edge.getSourceNodeId()))
                                    .findFirst()
                                    .orElseThrow(() -> new IllegalArgumentException("Source node not found"));
                                
                                if (sourceNode.getType().equals(NodeType.BRANCH)) {
                                    String caseId = edge.getSourceHandle().replace("case-", "");
                                    JsonNode branchData = sourceNode.getData().get("branch");
                                    if (!caseExistsInBranchNode(branchData, caseId)) {
                                        throw new IllegalArgumentException("Invalid branch case ID: " + caseId);
                                    }
                                }
                            }
                            edge.setWorkflow(existingWorkflow);
                            existingWorkflow.getEdges().add(edge);
                        }
                    }

                    return workflowRepository.save(existingWorkflow);
                })
                .orElseThrow(() -> new RuntimeException("Workflow not found with id: " + id));
    }

    private void validateWorkflow(Workflow workflow) {
        if (!StringUtils.hasText(workflow.getName())) {
            throw new IllegalArgumentException("Workflow name is required");
        }
        if (workflow.getNodes() == null || workflow.getNodes().isEmpty()) {
            throw new IllegalArgumentException("Workflow must have at least one node");
        }
    }

    private void validateEdge(WorkflowEdge edge) {
        if (!StringUtils.hasText(edge.getEdgeId())) {
            throw new IllegalArgumentException("Edge ID is required");
        }
        if (!StringUtils.hasText(edge.getSourceNodeId())) {
            throw new IllegalArgumentException("Source node ID is required");
        }
        if (!StringUtils.hasText(edge.getTargetNodeId())) {
            throw new IllegalArgumentException("Target node ID is required");
        }
        if (!StringUtils.hasText(edge.getSourceHandle())) {
            edge.setSourceHandle("default");
        }
    }

    private void processNodeData(WorkflowNode node) {
        Object data = node.getData();
        if (data != null && !(data instanceof JsonNode)) {
            try {
                JsonNode jsonNode = objectMapper.valueToTree(data);
                node.setData(jsonNode);
            } catch (Exception e) {
                throw new RuntimeException("Error converting node data to JSON", e);
            }
        }
    }

    @Transactional
    public void deleteWorkflow(Long id) {
        workflowRepository.deleteById(id);
    }

    @Transactional
    public Workflow toggleWorkflowStatus(Long id) {
        return workflowRepository.findById(id)
                .map(workflow -> {
                    workflow.setActive(!workflow.isActive());
                    return workflowRepository.save(workflow);
                })
                .orElseThrow(() -> new RuntimeException("Workflow not found with id: " + id));
    }
} 