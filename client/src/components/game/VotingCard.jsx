import { motion } from 'framer-motion'

const CARD_IMAGES = {
  0: '/cartes/0.png',
  1: '/cartes/1.png',
  2: '/cartes/2.png',
  3: '/cartes/3.png',
  5: '/cartes/5.png',
  8: '/cartes/8.png',
  13: '/cartes/13.png',
  20: '/cartes/20.png',
  40: '/cartes/40.png',
  100: '/cartes/100.png',
  '?': '/cartes/cartes_interro.png',
  '☕': '/cartes/cafe.png'
}

export default function VotingCard({ 
  value, 
  isSelected, 
  isDisabled, 
  onClick 
}) {
  return (
    <motion.div
      whileHover={!isDisabled ? { y: -12, scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      onClick={() => !isDisabled && onClick(value)}
      className={`
        aspect-[3/4] rounded-xl overflow-hidden
        cursor-pointer transition-all duration-200 shadow-lg
        ${isDisabled 
          ? 'grayscale opacity-50 cursor-not-allowed' 
          : 'hover:shadow-2xl'
        }
        ${isSelected 
          ? 'ring-4 ring-primary shadow-primary/50 scale-105' 
          : 'ring-2 ring-gray-600'
        }
        ${!isDisabled && !isSelected ? 'opacity-100' : ''}
        ${!isDisabled && isSelected ? 'opacity-100' : ''}
      `}
    >
      <img 
        src={CARD_IMAGES[value]} 
        alt={`Carte ${value}`}
        className="w-full h-full object-cover"
      />
    </motion.div>
  )
}
