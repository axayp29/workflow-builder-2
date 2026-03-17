import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import WorkflowList from '@/pages/WorkflowList'
import WorkflowBuilder from '@/pages/WorkflowBuilder'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workflows" element={<WorkflowList />} />
          <Route path="workflow/new" element={<WorkflowBuilder />} />
          <Route path="workflow/:id" element={<WorkflowBuilder />} />
          <Route path="workflow/:id/edit" element={<WorkflowBuilder />} />
          {/* Add more routes here as we create them */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
} 