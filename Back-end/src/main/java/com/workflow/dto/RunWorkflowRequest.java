package com.workflow.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class RunWorkflowRequest {
    private JsonNode eventData;

    public void validate() {
        if (eventData == null) {
            throw new IllegalArgumentException("Event data cannot be null");
        }
    }
} 