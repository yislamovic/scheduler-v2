import { motion } from 'framer-motion'

export default function SessionBadge({ sessionId }) {
  if (!sessionId) return null

  const shortId = sessionId.slice(0, 8)

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="session-badge group"
    >
      <span className="text-lg" role="img" aria-label="Demo">
        🎭
      </span>
      <span>Demo Session</span>
      <span className="text-xs opacity-75 font-mono">{shortId}</span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Your changes are isolated to this session.
        <br />
        Refresh the page to reset.
        <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
      </div>
    </motion.div>
  )
}
