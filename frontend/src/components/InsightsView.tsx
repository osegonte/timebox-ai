import { Event } from '../App'
import './InsightsView.css'
import { useEffect, useState } from 'react'

interface InsightsViewProps {
  events: Event[]
}

export default function InsightsView({ events }: InsightsViewProps) {
  const [insights, setInsights] = useState<any>(null)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/insights')
      const data = await res.json()
      setInsights(data)
    } catch (error) {
      console.error('Error fetching insights:', error)
    }
  }

  if (!insights) {
    return (
      <div className="insights-view">
        <div className="insights-header">
          <h1>📊 Schedule Insights</h1>
        </div>
        <div className="loading">Loading insights...</div>
      </div>
    )
  }

  return (
    <div className="insights-view">
      <div className="insights-header">
        <h1>📊 Schedule Insights</h1>
        <p>Analysis of your calendar and productivity</p>
      </div>

      <div className="insights-grid">
        <div className="insight-card">
          <div className="card-header">
            <h3>Total Events</h3>
          </div>
          <div className="card-value">{insights.total_events}</div>
          <div className="card-label">Scheduled</div>
        </div>

        {insights.conflicts && insights.conflicts.length > 0 && (
          <div className="insight-card warning">
            <div className="card-header">
              <h3>⚠️ Conflicts</h3>
            </div>
            <div className="card-value">{insights.conflicts.length}</div>
            <div className="card-label">Need attention</div>
          </div>
        )}

        {insights.upcoming_gaps && insights.upcoming_gaps.length > 0 && (
          <div className="insight-card success">
            <div className="card-header">
              <h3>✨ Free Slots</h3>
            </div>
            <div className="card-value">{insights.upcoming_gaps.length}</div>
            <div className="card-label">Available</div>
          </div>
        )}
      </div>

      {insights.insights && insights.insights.length > 0 && (
        <div className="insights-list-section">
          <h2>Key Insights</h2>
          <div className="insights-list">
            {insights.insights.map((insight: string, i: number) => (
              <div key={i} className="insight-item">
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.category_breakdown && (
        <div className="category-breakdown-section">
          <h2>Category Breakdown</h2>
          <div className="category-list">
            {Object.entries(insights.category_breakdown).map(([category, count]: [string, any]) => (
              <div key={category} className="category-item">
                <div className={`category-color ${category}`} />
                <div className="category-name">{category}</div>
                <div className="category-count">{count} events</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.conflicts && insights.conflicts.length > 0 && (
        <div className="conflicts-section">
          <h2>Schedule Conflicts</h2>
          <div className="conflicts-list">
            {insights.conflicts.map((conflict: any, i: number) => (
              <div key={i} className="conflict-item">
                <div className="conflict-events">
                  <div className="conflict-event">
                    <strong>{conflict.event1.title}</strong>
                    <span>{conflict.event1.start}</span>
                  </div>
                  <div className="conflict-separator">⚠️</div>
                  <div className="conflict-event">
                    <strong>{conflict.event2.title}</strong>
                    <span>{conflict.event2.start}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.upcoming_gaps && insights.upcoming_gaps.length > 0 && (
        <div className="gaps-section">
          <h2>Available Time Slots</h2>
          <div className="gaps-list">
            {insights.upcoming_gaps.map((gap: any, i: number) => (
              <div key={i} className="gap-item">
                <div className="gap-date">{gap.date}</div>
                <div className="gap-time">
                  {gap.start} - {gap.end}
                </div>
                <div className="gap-duration">{gap.duration_minutes} minutes</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}