package com.workflow.dto;

import java.util.List;
import java.util.ArrayList;
import lombok.Data;

@Data
public class EmailConfigurationDTO {
    private String subject;
    private String body;
    private List<EmailRecipientDTO> recipients = new ArrayList<>();
} 