import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EMPTY = 'EMPTY'
const SHOW = 'SHOW'
const CREATE = 'CREATE'
const CONFIRM = 'CONFIRM'
const DELETING = 'DELETING'
const EDIT = 'EDIT'
const ERROR_SAVE = 'ERROR_SAVE'
const ERROR_DELETE = 'ERROR_DELETE'

export default function Appointment({
  id,
  time,
  interview,
  interviewers = [],
  bookInterview,
  cancelInterview
}) {
  const [mode, setMode] = useState(interview ? SHOW : EMPTY)
  const [student, setStudent] = useState(interview?.student || '')
  const [interviewer, setInterviewer] = useState(interview?.interviewer || null)

  const save = async () => {
    if (!student || !interviewer) return

    try {
      await bookInterview(id, { student, interviewer })
      setMode(SHOW)
    } catch (error) {
      setMode(ERROR_SAVE)
    }
  }

  const destroy = async () => {
    setMode(DELETING)
    try {
      await cancelInterview(id)
      setMode(EMPTY)
    } catch (error) {
      setMode(ERROR_DELETE)
    }
  }

  return (
    <article className="appointment-card p-6">
      <div className="flex items-center gap-4">
        {/* Time */}
        <div className="flex-shrink-0 w-20">
          <time className="text-2xl font-bold text-gray-400">{time}</time>
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {mode === EMPTY && (
              <Empty key="empty" onAdd={() => setMode(CREATE)} />
            )}

            {mode === SHOW && interview && (
              <Show
                key="show"
                student={interview.student}
                interviewer={interviewers.find(i => i.id === interview.interviewer)}
                onEdit={() => {
                  setStudent(interview.student)
                  setInterviewer(interview.interviewer)
                  setMode(EDIT)
                }}
                onDelete={() => setMode(CONFIRM)}
              />
            )}

            {(mode === CREATE || mode === EDIT) && (
              <Form
                key="form"
                student={student}
                interviewer={interviewer}
                interviewers={interviewers}
                onStudentChange={setStudent}
                onInterviewerChange={setInterviewer}
                onSave={save}
                onCancel={() => {
                  setStudent('')
                  setInterviewer(null)
                  setMode(interview ? SHOW : EMPTY)
                }}
              />
            )}

            {mode === CONFIRM && (
              <Confirm
                key="confirm"
                message="Are you sure you want to delete?"
                onConfirm={destroy}
                onCancel={() => setMode(SHOW)}
              />
            )}

            {mode === DELETING && (
              <Status key="deleting" message="Deleting..." />
            )}

            {mode === ERROR_SAVE && (
              <Error
                key="error-save"
                message="Could not save appointment"
                onClose={() => setMode(CREATE)}
              />
            )}

            {mode === ERROR_DELETE && (
              <Error
                key="error-delete"
                message="Could not cancel appointment"
                onClose={() => setMode(SHOW)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  )
}

function Empty({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-20"
    >
      <button
        onClick={onAdd}
        className="btn btn-secondary px-8"
      >
        + Add
      </button>
    </motion.div>
  )
}

function Show({ student, interviewer, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        {interviewer && (
          <img
            src={interviewer.avatar}
            alt={interviewer.name}
            className="w-12 h-12 rounded-full border-2 border-primary-200"
          />
        )}
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{student}</h3>
          {interviewer && (
            <p className="text-sm text-gray-500">Interviewer: {interviewer.name}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-600 hover:text-danger-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

function Form({
  student,
  interviewer,
  interviewers,
  onStudentChange,
  onInterviewerChange,
  onSave,
  onCancel
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="space-y-4"
    >
      <input
        type="text"
        placeholder="Enter student name"
        value={student}
        onChange={(e) => onStudentChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <div className="flex flex-wrap gap-2">
        {interviewers.map(i => (
          <button
            key={i.id}
            onClick={() => onInterviewerChange(i.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
              ${interviewer === i.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
              }
            `}
          >
            <img
              src={i.avatar}
              alt={i.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium">{i.name}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!student || !interviewer}
          className="btn btn-primary"
        >
          Save
        </button>
      </div>
    </motion.div>
  )
}

function Confirm({ message, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center justify-between"
    >
      <p className="text-lg text-gray-900">{message}</p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button onClick={onConfirm} className="btn btn-danger">
          Confirm
        </button>
      </div>
    </motion.div>
  )
}

function Status({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-20"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full"
        />
        <p className="text-gray-600">{message}</p>
      </div>
    </motion.div>
  )
}

function Error({ message, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center justify-between bg-danger-50 border border-danger-200 rounded-lg p-4"
    >
      <p className="text-danger-900">{message}</p>
      <button onClick={onClose} className="btn btn-secondary">
        Close
      </button>
    </motion.div>
  )
}
