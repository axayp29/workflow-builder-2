-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,
    days_before_event INT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Create workflow_nodes table
CREATE TABLE IF NOT EXISTS workflow_nodes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    node_id VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    data TEXT,
    position_x DOUBLE NOT NULL,
    position_y DOUBLE NOT NULL,
    workflow_id BIGINT NOT NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Create workflow_edges table
CREATE TABLE IF NOT EXISTS workflow_edges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    edge_id VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    workflow_id BIGINT NOT NULL,
    source_handle VARCHAR(255) NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);