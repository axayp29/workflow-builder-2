package com.workflow.entity;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Entity
@Table(name = "workflow_edges")
@JsonIgnoreProperties(ignoreUnknown = true)
public class WorkflowEdge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "edge_id", nullable = false, unique = true)
    private String edgeId;  // This will store the frontend edge ID

    @Column(name = "source", nullable = false)
    private String sourceNodeId;  // Store the source node's nodeId

    @Column(name = "source_handle", nullable = false)
    private String sourceHandle;  // Store the source handle (e.g., "case-123" for branch cases)

    @Column(name = "target", nullable = false)
    private String targetNodeId;  // Store the target node's nodeId


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    @JsonIgnore
    private Workflow workflow;

    // Custom getter to match frontend structure
    public String getSource() {
        return sourceNodeId;
    }

    // Custom setter to match frontend structure
    public void setSource(String source) {
        this.sourceNodeId = source;
    }

    // Custom getter to match frontend structure
    public String getTarget() {
        return targetNodeId;
    }

    // Custom setter to match frontend structure
    public void setTarget(String target) {
        this.targetNodeId = target;
    }

    // Custom getter for sourceHandle to match frontend structure
    @JsonProperty("sourceHandle")
    public String getSourceHandle() {
        return sourceHandle;
    }

    // Custom setter for sourceHandle to match frontend structure
    @JsonProperty("sourceHandle")
    public void setSourceHandle(String sourceHandle) {
        this.sourceHandle = sourceHandle;
    }
} 