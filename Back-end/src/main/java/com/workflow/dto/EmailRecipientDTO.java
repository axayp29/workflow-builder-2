package com.workflow.dto;

import lombok.Data;

@Data
public class EmailRecipientDTO {
    private String email;
    private String name;
    private String type;  // TO, CC, BCC
} 