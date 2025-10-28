import { Link, useLocation } from 'react-router-dom'
import { Menu, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import './TopNav.css'

interface TopNavProps {
  currentView: 'day' | 'week' | 'month'
  onViewChange: (view: 'day' | 'week' | 'month') => void
  onTodayClick: () => void
}

export default function TopNav({ currentView, onViewChange, onTodayClick }: TopNavProps) {
  const location = useLocation()
  const isInsights = location.pathname === '/insights'

  return (
    <div className="top-nav">
      <div className="top-nav-left">
        <button className="icon-btn">
          <Menu size={20} />
        </button>
        <Link to="/" className="app-title">
          <span className="app-icon">🕒</span>
          TimeBox AI
        </Link>
      </div>

      {!isInsights && (
        <div className="top-nav-center">
          <div className="view-switcher">
            <button
              className={currentView === 'day' ? 'active' : ''}
              onClick={() => onViewChange('day')}
            >
              Day
            </button>
            <button
              className={currentView === 'week' ? 'active' : ''}
              onClick={() => onViewChange('week')}
            >
              Week
            </button>
            <button
              className={currentView === 'month' ? 'active' : ''}
              onClick={() => onViewChange('month')}
            >
              Month
            </button>
          </div>
        </div>
      )}

      <div className="top-nav-right">
        {!isInsights && (
          <>
            <button className="icon-btn" onClick={onTodayClick}>
              <ChevronLeft size={16} />
            </button>
            <button className="today-btn" onClick={onTodayClick}>
              Today
            </button>
            <button className="icon-btn" onClick={onTodayClick}>
              <ChevronRight size={16} />
            </button>
          </>
        )}
        
        <Link to="/insights" className="insights-btn">
          <Settings size={18} />
          Insights
        </Link>
      </div>
    </div>
  )
}