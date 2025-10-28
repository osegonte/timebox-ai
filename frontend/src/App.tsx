import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CalendarView from './components/CalendarView'
import InsightsView from './components/InsightsView'
import ChatBar from './components/ChatBar'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import './App.css'

export interface Event {
  id: string
  title: string
  start: Date
  end: Date
  category: string
}

function App() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('week')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      
      const formattedEvents = data.events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }))
      
      setEvents(formattedEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleEventCreated = () => {
    fetchEvents()
  }

  return (
    <Router>
      <div className="app-container">
        <TopNav 
          currentView={currentView}
          onViewChange={setCurrentView}
          onTodayClick={() => setSelectedDate(new Date())}
        />
        
        <div className="main-content">
          <div className="calendar-container">
            <Routes>
              <Route path="/" element={
                <CalendarView
                  events={events}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  currentView={currentView}
                  onEventSelect={setSelectedEvent}
                />
              } />
              <Route path="/insights" element={
                <InsightsView events={events} />
              } />
            </Routes>
          </div>

          {sidebarOpen && (
            <Sidebar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedEvent={selectedEvent}
              events={events}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </div>

        <ChatBar onEventCreated={handleEventCreated} />
      </div>
    </Router>
  )
}

export default App