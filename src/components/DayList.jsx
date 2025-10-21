import { motion } from 'framer-motion'

function DayListItem({ name, spots, selected, onChange }) {
  const formatSpots = (spots) => {
    if (spots === 0) return 'no spots remaining'
    if (spots === 1) return '1 spot remaining'
    return `${spots} spots remaining`
  }

  return (
    <motion.li
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      className="mb-2"
    >
      <button
        onClick={() => onChange(name)}
        className={`
          w-full text-left px-4 py-3 rounded-lg transition-all duration-200
          ${selected
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }
        `}
      >
        <h3 className={`font-semibold ${selected ? 'text-white' : 'text-gray-900'}`}>
          {name}
        </h3>
        <p className={`text-sm mt-1 ${selected ? 'text-primary-100' : 'text-gray-500'}`}>
          {formatSpots(spots)}
        </p>
      </button>
    </motion.li>
  )
}

export default function DayList({ days, value, onChange }) {
  return (
    <nav>
      <ul className="space-y-1">
        {days.map(day => (
          <DayListItem
            key={day.id}
            name={day.name}
            spots={day.spots}
            selected={day.name === value}
            onChange={onChange}
          />
        ))}
      </ul>
    </nav>
  )
}
