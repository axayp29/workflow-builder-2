package com.workflow.repository;

import com.workflow.entity.WorkflowNodeExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowNodeExecutionRepository extends JpaRepository<WorkflowNodeExecution, Long> {
    List<WorkflowNodeExecution> findByWorkflowExecutionIdOrderByExecutionOrderAsc(Long workflowExecutionId);
    List<WorkflowNodeExecution> findByWorkflowExecutionIdAndNodeId(Long workflowExecutionId, String nodeId);
    List<WorkflowNodeExecution> findByWorkflowExecutionIdAndParentNodeId(Long workflowExecutionId, String parentNodeId);
} 