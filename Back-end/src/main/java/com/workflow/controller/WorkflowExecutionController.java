package com.workflow.controller;

import com.workflow.dto.RunWorkflowRequest;
import com.workflow.dto.WorkflowExecutionDTO;
import com.workflow.dto.WorkflowNodeExecutionDTO;
import com.workflow.service.WorkflowExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@CrossOrigin(origins = "http://localhost:5173") // Allow requests from the frontend
public class WorkflowExecutionController {

    @Autowired
    private WorkflowExecutionService workflowExecutionService;

    @PostMapping("/{workflowId}/execute")
    public ResponseEntity<Long> executeWorkflow(
            @PathVariable Long workflowId,
            @RequestBody RunWorkflowRequest request) {
        return ResponseEntity.ok(workflowExecutionService.createExecution(workflowId, request));
    }

    @GetMapping("/{workflowId}/executions")
    public ResponseEntity<List<WorkflowExecutionDTO>> getWorkflowExecutions(
            @PathVariable Long workflowId) {
        return ResponseEntity.ok(workflowExecutionService.getWorkflowExecutions(workflowId));
    }

    @GetMapping("/{workflowId}/executions/{executionId}/nodes")
    public ResponseEntity<List<WorkflowNodeExecutionDTO>> getNodeExecutions(
            @PathVariable Long workflowId,
            @PathVariable Long executionId) {
        return ResponseEntity.ok(workflowExecutionService.getNodeExecutions(workflowId, executionId));
    }
} 