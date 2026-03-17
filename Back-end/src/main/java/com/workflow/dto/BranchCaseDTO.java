package com.workflow.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.Data;

@Data
public class BranchCaseDTO {
    private String name;
    private String description;
    private List<WorkflowConditionDTO> conditions = new ArrayList<>();
} 