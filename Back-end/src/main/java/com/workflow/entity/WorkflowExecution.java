package com.workflow.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonType;
import lombok.Data;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_execution")
@TypeDef(name = "json", typeClass = JsonType.class)
@Data
public class WorkflowExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    private Workflow workflow;

    @Column(name = "execution_time", nullable = false)
    private LocalDateTime executionTime;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "execution_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ExecutionStatus executionStatus;

    @Type(type = "json")
    @Column(name = "event_data", columnDefinition = "json")
    private JsonNode eventData;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    public enum ExecutionStatus {
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }
} 