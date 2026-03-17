import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const stats = [
  {
    name: 'Total Workflows',
    value: '12',
    icon: DocumentTextIcon,
    change: '+4.75%',
    changeType: 'positive',
  },
  {
    name: 'Active Users',
    value: '573',
    icon: UserGroupIcon,
    change: '+54.02%',
    changeType: 'positive',
  },
  {
    name: 'Avg. Processing Time',
    value: '2.4m',
    icon: ClockIcon,
    change: '-1.39%',
    changeType: 'negative',
  },
  {
    name: 'Success Rate',
    value: '98.2%',
    icon: ChartBarIcon,
    change: '+0.5%',
    changeType: 'positive',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="mt-4 sm:mt-0">
          <Link to="/workflows/new" className="btn btn-primary">
            Create New Workflow
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <div className="mt-4">
          <div className="flow-root">
            <ul className="-mb-8">
              {/* Add activity items here */}
              <li className="text-sm text-gray-500">No recent activity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 