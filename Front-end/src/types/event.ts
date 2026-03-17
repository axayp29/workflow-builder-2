export enum EventField {
  EVENT_STATUS = 'EVENT_STATUS',
  EVENT_FORMAT = 'EVENT_FORMAT',
  EVENT_LOCATION = 'EVENT_LOCATION',
  EVENT_START_DATE = 'EVENT_START_DATE',
  EVENT_END_DATE = 'EVENT_END_DATE',
  EVENT_CURRENCY = 'EVENT_CURRENCY',
  EVENT_BUDGET = 'EVENT_BUDGET'
}

export const EventFieldLabels: Record<EventField, string> = {
  [EventField.EVENT_STATUS]: 'Event Status',
  [EventField.EVENT_FORMAT]: 'Event Format',
  [EventField.EVENT_LOCATION]: 'Event Location',
  [EventField.EVENT_START_DATE]: 'Event Start Date',
  [EventField.EVENT_END_DATE]: 'Event End Date',
  [EventField.EVENT_CURRENCY]: 'Event Currency',
  [EventField.EVENT_BUDGET]: 'Event Budget'
}

// Event status options
export enum EventStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

// Event format options
export enum EventFormat {
  IN_PERSON = 'IN_PERSON',
  VIRTUAL = 'VIRTUAL',
  HYBRID = 'HYBRID'
}

// Event location options (example cities)
export enum EventLocation {
  NEW_YORK = 'NEW_YORK',
  LONDON = 'LONDON',
  TOKYO = 'TOKYO',
  SINGAPORE = 'SINGAPORE',
  DUBAI = 'DUBAI',
  SYDNEY = 'SYDNEY'
}

// Currency options
export enum EventCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  SGD = 'SGD',
  AED = 'AED',
  AUD = 'AUD'
}

// Field type mapping to determine what kind of input/validation to use
export const EventFieldTypes: Record<EventField, 'select' | 'date' | 'number' | 'text'> = {
  [EventField.EVENT_STATUS]: 'select',
  [EventField.EVENT_FORMAT]: 'select',
  [EventField.EVENT_LOCATION]: 'select',
  [EventField.EVENT_START_DATE]: 'date',
  [EventField.EVENT_END_DATE]: 'date',
  [EventField.EVENT_CURRENCY]: 'select',
  [EventField.EVENT_BUDGET]: 'number'
}

// Options for select fields
export const EventFieldOptions: Record<EventField, Record<string, string>> = {
  [EventField.EVENT_STATUS]: Object.fromEntries(
    Object.entries(EventStatus).map(([key, value]) => [
      value,
      key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
    ])
  ),
  [EventField.EVENT_FORMAT]: Object.fromEntries(
    Object.entries(EventFormat).map(([key, value]) => [
      value,
      key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
    ])
  ),
  [EventField.EVENT_LOCATION]: Object.fromEntries(
    Object.entries(EventLocation).map(([key, value]) => [
      value,
      key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
    ])
  ),
  [EventField.EVENT_CURRENCY]: Object.fromEntries(
    Object.entries(EventCurrency).map(([key, value]) => [value, key])
  ),
  [EventField.EVENT_START_DATE]: {},
  [EventField.EVENT_END_DATE]: {},
  [EventField.EVENT_BUDGET]: {}
} 