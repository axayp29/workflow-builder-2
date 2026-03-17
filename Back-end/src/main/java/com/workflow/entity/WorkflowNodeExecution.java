package com.workflow.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.workflow.enums.NodeType;
import com.vladmihalcea.hibernate.type.json.JsonType;
import lombok.Data;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_node_execution")
@TypeDef(name = "json", typeClass = JsonType.class)
@Data
public class WorkflowNodeExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_execution_id", nullable = false)
    private WorkflowExecution workflowExecution;

    @Column(name = "node_id", nullable = false)
    private String nodeId;

    @Column(name = "node_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private NodeType nodeType;

    @Column(name = "execution_order", nullable = false)
    private Integer executionOrder;

    @Column(name = "execution_time", nullable = false)
    private LocalDateTime executionTime;

    @Column(name = "execution_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ExecutionStatus executionStatus;

    @Type(type = "json")
    @Column(name = "input_data", columnDefinition = "json")
    private JsonNode inputData;

    @Type(type = "json")
    @Column(name = "output_data", columnDefinition = "json")
    private JsonNode outputData;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "parent_node_id")
    private String parentNodeId;

    @Column(name = "branch_case_id")
    private String branchCaseId;

    public enum ExecutionStatus {
        STARTED,
        COMPLETED,
        FAILED,
        SKIPPED
    }
} 