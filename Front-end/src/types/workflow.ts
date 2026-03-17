export enum TriggerType {
  EVENT_FORM_SUBMITTED = 'EVENT_FORM_SUBMITTED',
  EVENT_STATUS_CHANGE = 'EVENT_STATUS_CHANGE',
  DAYS_BEFORE_EVENT_END = 'DAYS_BEFORE_EVENT_END',
}

export enum Operator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_EQUALS = 'GREATER_THAN_EQUALS',
  LESS_THAN_EQUALS = 'LESS_THAN_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum ActionType {
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  UPDATE_STATUS = 'UPDATE_STATUS',
  CREATE_TASK = 'CREATE_TASK',
  DO_NOTHING = 'DO_NOTHING',
}

export enum NodeTypes {
  TRIGGER = 'TRIGGER',
  CONDITION = 'CONDITION',
  BRANCH = 'BRANCH',
  ACTION = 'ACTION',
  END = 'END'
}

export interface WorkflowCondition {
  id: number
  field: string
  operator: Operator
  value: string
  logicalOperator?: LogicalOperator
}

export interface EmailRecipient {
  id: number
  email: string
  name?: string
  type: 'to' | 'cc' | 'bcc'
}

export interface EmailConfiguration {
  subject: string
  body: string
  recipients: EmailRecipient[]
  template?: string
}

export interface WorkflowAction {
  type: ActionType
  configuration: EmailConfiguration | Record<string, any>
}

export interface BranchCase {
  id: number
  name: string
  conditions: WorkflowCondition[]
  description?: string
}

export interface WorkflowBranch {
  name: string
  cases: BranchCase[]
  defaultCase?: BranchCase
}

export interface Workflow {
  id?: number
  name: string
  description: string
  triggerType: TriggerType
  daysBeforeEvent?: number
  conditions: WorkflowCondition[]
  branches: WorkflowBranch[]
  active: boolean
  createdAt?: string
  updatedAt?: string
} 