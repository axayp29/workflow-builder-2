package com.workflow.enums;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.util.StdConverter;

@JsonDeserialize(converter = NodeType.NodeTypeConverter.class)
public enum NodeType {
    TRIGGER,
    CONDITION,
    BRANCH,
    ACTION,
    END;

    public static class NodeTypeConverter extends StdConverter<String, NodeType> {
        @Override
        public NodeType convert(String value) {
            try {
                return NodeType.valueOf(value.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid node type: " + value + ". Valid values are: " + 
                    String.join(", ", java.util.Arrays.stream(NodeType.values())
                        .map(Enum::name)
                        .toArray(String[]::new)));
            }
        }
    }
} 