package com.workflow.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.Data;

@Data
public class WorkflowBranchDTO {
    private String name;
    private List<BranchCaseDTO> cases = new ArrayList<>();
    private BranchCaseDTO defaultCase;
} 