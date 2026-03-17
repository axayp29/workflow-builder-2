package com.workflow.entity;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import org.hibernate.annotations.Type;
import java.util.List;
import java.util.ArrayList;
import com.workflow.enums.NodeType;


@Data
@Entity
@Table(name = "workflow_nodes")
@JsonIgnoreProperties(ignoreUnknown = true)  // Ignore unknown fields like 'position'
public class WorkflowNode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "node_id", nullable = false, unique = true)
    private String nodeId;  // This will store the frontend node ID (e.g., "trigger", "action-1", etc.)


    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private NodeType type;


    @Type(type = "com.workflow.config.JsonTypeConverter")
    @Column(columnDefinition = "TEXT")
    private JsonNode data;

    @Column(name = "position_x", nullable = false)
    private Double positionX;

    @Column(name = "position_y", nullable = false)
    private Double positionY;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    @JsonIgnore
    private Workflow workflow;

    @OneToMany(mappedBy = "sourceNodeId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkflowEdge> outgoingEdges = new ArrayList<>();

    @OneToMany(mappedBy = "targetNodeId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkflowEdge> incomingEdges = new ArrayList<>();

    // Transient field to handle position object from frontend
    @Transient
    @JsonProperty("position")
    private Position position;

    // Inner class to handle position object
    @Data
    public static class Position {
        private Double x;
        private Double y;
    }

    // Custom setter to map position object to positionX and positionY
    public void setPosition(Position position) {
        if (position != null) {
            this.positionX = position.getX();
            this.positionY = position.getY();
        }
    }

    // Custom getter to create position object from positionX and positionY
    public Position getPosition() {
        Position pos = new Position();
        pos.setX(this.positionX);
        pos.setY(this.positionY);
        return pos;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public NodeType getType() {
        return type;
    }

    public void setType(NodeType type) {
        this.type = type;
    }

    public Double getPositionX() {
        return positionX;
    }

    public void setPositionX(Double positionX) {
        this.positionX = positionX;
    }

    public Double getPositionY() {
        return positionY;
    }

    public void setPositionY(Double positionY) {
        this.positionY = positionY;
    }

    public Workflow getWorkflow() {
        return workflow;
    }

    public void setWorkflow(Workflow workflow) {
        this.workflow = workflow;
    }

    public List<WorkflowEdge> getOutgoingEdges() {
        return outgoingEdges;
    }

    public void setOutgoingEdges(List<WorkflowEdge> outgoingEdges) {
        this.outgoingEdges = outgoingEdges;
    }

    public List<WorkflowEdge> getIncomingEdges() {
        return incomingEdges;
    }

    public void setIncomingEdges(List<WorkflowEdge> incomingEdges) {
        this.incomingEdges = incomingEdges;
    }

} 