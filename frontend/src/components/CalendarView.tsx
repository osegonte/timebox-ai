import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { Event } from '../App'
import './CalendarView.css'

interface CalendarViewProps {
  events: Event[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  currentView: 'day' | 'week' | 'month'
  onEventSelect: (event: Event) => void
}

export default function CalendarView({ 
  events, 
  selectedDate, 
  onDateChange, 
  currentView,
  onEventSelect 
}: CalendarViewProps) {
  
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayEvents = events.filter(e => isSameDay(e.start, selectedDate))

    return (
      <div className="calendar-day-view">
        <div className="day-header">
          <h2>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
        </div>
        
        <div className="day-grid">
          <div className="time-column">
            {hours.map(hour => (
              <div key={hour} className="time-slot">
                <span className="time-label">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>
          
          <div className="events-column">
            <div className="hour-lines">
              {hours.map(hour => (
                <div key={hour} className="hour-line" />
              ))}
            </div>
            
            {dayEvents.map(event => {
              const startHour = event.start.getHours() + event.start.getMinutes() / 60
              const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)
              
              return (
                <div
                  key={event.id}
                  className={`event-block ${event.category}`}
                  style={{
                    top: `${startHour * 60}px`,
                    height: `${duration * 60}px`
                  }}
                  onClick={() => onEventSelect(event)}
                >
                  <div className="event-dot" />
                  <div className="event-title">{event.title}</div>
                  <div className="event-time">
                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="calendar-week-view">
        <div className="week-header">
          <div className="week-header-time"></div>
          {weekDays.map(day => (
            <div key={day.toString()} className={`week-header-day ${isSameDay(day, new Date()) ? 'today' : ''}`}>
              <div className="day-name">{format(day, 'EEE')}</div>
              <div className="day-number">{format(day, 'd')}</div>
            </div>
          ))}
        </div>

        <div className="week-grid">
          <div className="time-column">
            {hours.map(hour => (
              <div key={hour} className="time-slot">
                <span className="time-label">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {weekDays.map(day => {
            const dayEvents = events.filter(e => isSameDay(e.start, day))
            
            return (
              <div key={day.toString()} className="day-column">
                <div className="hour-lines">
                  {hours.map(hour => (
                    <div key={hour} className="hour-line" />
                  ))}
                </div>

                {dayEvents.map(event => {
                  const startHour = event.start.getHours() + event.start.getMinutes() / 60
                  const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)
                  
                  return (
                    <div
                      key={event.id}
                      className={`event-block ${event.category}`}
                      style={{
                        top: `${startHour * 60}px`,
                        height: `${duration * 60}px`
                      }}
                      onClick={() => onEventSelect(event)}
                    >
                      <div className="event-dot" />
                      <div className="event-title">{event.title}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 34)
    
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const weeks = []
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    return (
      <div className="calendar-month-view">
        <div className="month-header">
          <h2>{format(selectedDate, 'MMMM yyyy')}</h2>
        </div>

        <div className="month-weekdays">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="month-grid">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="month-week">
              {week.map(day => {
                const dayEvents = events.filter(e => isSameDay(e.start, day))
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
                const isToday = isSameDay(day, new Date())
                
                return (
                  <div
                    key={day.toString()}
                    className={`month-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => onDateChange(day)}
                  >
                    <div className="day-number">{format(day, 'd')}</div>
                    <div className="day-events">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className={`month-event ${event.category}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventSelect(event)
                          }}
                        >
                          <div className="event-dot" />
                          <span>{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="more-events">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-view">
      {currentView === 'day' && renderDayView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'month' && renderMonthView()}
    </div>
  )
}