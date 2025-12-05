// Card.jsx - Composant Card avec thème bleu/blanc
import { motion } from 'framer-motion'

export default function Card({ 
  children, 
  className = '', 
  onClick,
  hover = false,
  selected = false 
}) {
  const baseStyles = 'bg-white rounded-2xl p-6 shadow-card border border-blue-100 transition-all duration-300'
  const hoverStyles = hover ? 'cursor-pointer hover:border-blue-400 hover:shadow-card-hover' : ''
  const selectedStyles = selected ? 'border-blue-500 border-2 shadow-blue' : ''
  
  const CardWrapper = onClick ? motion.div : 'div'
  
  return (
    <CardWrapper
      whileHover={hover && onClick ? { scale: 1.02, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${selectedStyles} ${className}`}
    >
      {children}
    </CardWrapper>
  )
}