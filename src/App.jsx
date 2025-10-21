import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import DayList from './components/DayList'
import Appointment from './components/Appointment'
import SessionBadge from './components/SessionBadge'

function App() {
  const [state, setState] = useState({
    day: 'Monday',
    days: [],
    appointments: {},
    interviewers: {},
    sessionId: null,
    loading: true
  })

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data } = await axios.post('/api/session/init')
        const sessionId = data.sessionId

        // Set up axios interceptor to add session ID to all requests
        axios.interceptors.request.use((config) => {
          config.headers['x-session-id'] = sessionId
          return config
        })

        // Fetch initial data
        const [daysRes, appointmentsRes, interviewersRes] = await Promise.all([
          axios.get('/api/days'),
          axios.get('/api/appointments'),
          axios.get('/api/interviewers')
        ])

        setState(prev => ({
          ...prev,
          sessionId,
          days: daysRes.data,
          appointments: appointmentsRes.data,
          interviewers: interviewersRes.data,
          loading: false
        }))
      } catch (error) {
        console.error('Failed to initialize session:', error)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    initSession()
  }, [])

  const setDay = (day) => {
    setState(prev => ({ ...prev, day }))
  }

  const bookInterview = async (id, interview) => {
    try {
      await axios.put(`/api/appointments/${id}`, { interview })

      const appointment = {
        ...state.appointments[id],
        interview
      }

      const appointments = {
        ...state.appointments,
        [id]: appointment
      }

      // Fetch updated days with new spots count
      const { data: days } = await axios.get('/api/days')

      setState(prev => ({
        ...prev,
        appointments,
        days
      }))
    } catch (error) {
      console.error('Failed to book interview:', error)
      throw error
    }
  }

  const cancelInterview = async (id) => {
    try {
      await axios.delete(`/api/appointments/${id}`)

      const appointment = {
        ...state.appointments[id],
        interview: null
      }

      const appointments = {
        ...state.appointments,
        [id]: appointment
      }

      // Fetch updated days with new spots count
      const { data: days } = await axios.get('/api/days')

      setState(prev => ({
        ...prev,
        appointments,
        days
      }))
    } catch (error) {
      console.error('Failed to cancel interview:', error)
      throw error
    }
  }

  const getAppointmentsForDay = () => {
    const selectedDay = state.days.find(d => d.name === state.day)
    if (!selectedDay) return []

    return selectedDay.appointments.map(id => state.appointments[id]).filter(Boolean)
  }

  const getInterviewersForDay = () => {
    const selectedDay = state.days.find(d => d.name === state.day)
    if (!selectedDay) return []

    return selectedDay.interviewers
      .map(id => state.interviewers[id])
      .filter(Boolean)
  }

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const appointments = getAppointmentsForDay()
  const interviewers = getInterviewersForDay()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:w-80 bg-white shadow-xl lg:shadow-2xl"
        >
          <div className="p-6 lg:p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Interview Scheduler
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Demo Mode - Try it out!
              </p>
            </motion.div>

            <hr className="border-gray-200 mb-6" />

            <DayList
              days={state.days}
              value={state.day}
              onChange={setDay}
            />
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto space-y-4"
          >
            {appointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (index * 0.05) }}
              >
                <Appointment
                  {...appointment}
                  interviewers={interviewers}
                  bookInterview={bookInterview}
                  cancelInterview={cancelInterview}
                />
              </motion.div>
            ))}

            {/* Last appointment slot */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (appointments.length * 0.05) }}
            >
              <Appointment id="last" time="5pm" />
            </motion.div>
          </motion.div>
        </main>
      </div>

      <SessionBadge sessionId={state.sessionId} />
    </div>
  )
}

export default App
