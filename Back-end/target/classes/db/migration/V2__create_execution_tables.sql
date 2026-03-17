-- Create workflow_execution table
CREATE TABLE IF NOT EXISTS workflow_execution (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    execution_time DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    format VARCHAR(50) NOT NULL,
    budget DECIMAL(19,2) NOT NULL,
    event_data JSON,
    execution_status VARCHAR(20) NOT NULL,
    error_message TEXT,
    completed_at DATETIME,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Create workflow_node_execution table
CREATE TABLE IF NOT EXISTS workflow_node_execution (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_execution_id BIGINT NOT NULL,
    node_id VARCHAR(255) NOT NULL,
    node_type VARCHAR(50) NOT NULL,
    execution_order INT NOT NULL,
    execution_time DATETIME NOT NULL,
    execution_status VARCHAR(20) NOT NULL,
    input_data JSON,
    output_data JSON,
    error_message TEXT,
    parent_node_id VARCHAR(255),
    branch_case_id VARCHAR(255),
    FOREIGN KEY (workflow_execution_id) REFERENCES workflow_execution(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX idx_workflow_execution_workflow_id ON workflow_execution(workflow_id);
CREATE INDEX idx_workflow_execution_status ON workflow_execution(execution_status);
CREATE INDEX idx_workflow_node_execution_workflow_execution_id ON workflow_node_execution(workflow_execution_id);
CREATE INDEX idx_workflow_node_execution_node_id ON workflow_node_execution(node_id);
CREATE INDEX idx_workflow_node_execution_parent_node_id ON workflow_node_execution(parent_node_id); 