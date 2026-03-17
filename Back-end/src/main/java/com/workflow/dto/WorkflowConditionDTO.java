package com.workflow.dto;

import com.workflow.enums.Operator;
import com.workflow.enums.LogicalOperator;
import lombok.Data;

@Data
public class WorkflowConditionDTO {
    private String field;
    private Object value;
    private Operator operator;
    private LogicalOperator logicalOperator;
} 