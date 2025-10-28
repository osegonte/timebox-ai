import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, isSameDay, isSameMonth } from 'date-fns'
import { X } from 'lucide-react'
import { Event } from '../App'
import './Sidebar.css'

interface SidebarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  selectedEvent: Event | null
  events: Event[]
  onClose: () => void
}

export default function Sidebar({ selectedDate, onDateChange, selectedEvent, events, onClose }: SidebarProps) {
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = startOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const calendarDays = eachDayOfInterval({ 
    start: startDate, 
    end: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 6) 
  })

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Mini Calendar */}
        <div className="mini-calendar">
          <div className="mini-calendar-header">
            <h3>{format(selectedDate, 'MMMM yyyy')}</h3>
          </div>

          <div className="mini-calendar-weekdays">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="mini-weekday">{day}</div>
            ))}
          </div>

          <div className="mini-calendar-grid">
            {calendarDays.map(day => {
              const isSelected = isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, selectedDate)
              const hasEvents = events.some(e => isSameDay(e.start, day))

              return (
                <button
                  key={day.toString()}
                  className={`mini-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                  onClick={() => onDateChange(day)}
                >
                  {format(day, 'd')}
                  {hasEvents && <div className="event-indicator" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Event Details */}
        <div className="event-details">
          {selectedEvent ? (
            <>
              <h3>Event Details</h3>
              <div className="detail-group">
                <div className="detail-label">Title</div>
                <div className="detail-value">{selectedEvent.title}</div>
              </div>
              <div className="detail-group">
                <div className="detail-label">Time</div>
                <div className="detail-value">
                  {format(selectedEvent.start, 'MMM d, yyyy')} <br />
                  {format(selectedEvent.start, 'h:mm a')} - {format(selectedEvent.end, 'h:mm a')}
                </div>
              </div>
              <div className="detail-group">
                <div className="detail-label">Category</div>
                <div className={`category-badge ${selectedEvent.category}`}>
                  {selectedEvent.category}
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">📅</div>
              <div className="no-selection-text">No Event Selected</div>
              <div className="no-selection-hint">Click on an event to see details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}