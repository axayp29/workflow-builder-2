import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { API_ENDPOINTS } from '@/config/api'

interface WorkflowExecutionModalProps {
  workflowId: number
  isOpen: boolean
  onClose: () => void
  onExecutionStarted: () => void
}

export default function WorkflowExecutionModal({
  workflowId,
  isOpen,
  onClose,
  onExecutionStarted
}: WorkflowExecutionModalProps) {
  const [eventData, setEventData] = useState({
    EVENT_STATUS: 'DRAFT',
    EVENT_FORMAT: 'VIRTUAL',
    EVENT_BUDGET: '0',
    location: 'ONLINE',
    currency: 'USD',
    startDate: '',
    endDate: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(API_ENDPOINTS.WORKFLOW_EXECUTION(workflowId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start workflow execution')
      }

      const executionId = await response.json()
      console.log('Workflow execution started with ID:', executionId)
      onExecutionStarted()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start workflow execution')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Start Workflow Execution</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Event Status</label>
            <select
              className="input w-full"
              value={eventData.EVENT_STATUS}
              onChange={(e) => setEventData(prev => ({ ...prev, EVENT_STATUS: e.target.value }))}
              required
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approve</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Event Format</label>
            <select
              className="input w-full"
              value={eventData.EVENT_FORMAT}
              onChange={(e) => setEventData(prev => ({ ...prev, EVENT_FORMAT: e.target.value }))}
              required
            >
              <option value="VIRTUAL">Virtual</option>
              <option value="IN_PERSON">In Person</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Budget</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="input flex-1"
                value={eventData.EVENT_BUDGET}
                onChange={(e) => setEventData(prev => ({ ...prev, EVENT_BUDGET: e.target.value }))}
                min="0"
                step="0.01"
                required
              />
              <select
                className="input w-24"
                value={eventData.currency}
                onChange={(e) => setEventData(prev => ({ ...prev, currency: e.target.value }))}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <select
              className="input w-full"
              value={eventData.location}
              onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
              required
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="datetime-local"
                className="input w-full"
                value={eventData.startDate}
                onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="datetime-local"
                className="input w-full"
                value={eventData.endDate}
                onChange={(e) => setEventData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="input w-full"
              rows={3}
              value={eventData.description}
              onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter event description"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Starting...
                </>
              ) : (
                'Start Execution'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 