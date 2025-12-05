// Input.jsx - Composant Input avec thème bleu/blanc
export default function Input({ 
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  helperText,
  required = false,
  type = 'text',
  className = ''
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
            <Icon size={20} />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 rounded-xl
            ${Icon ? 'pl-10' : ''}
            ${error 
              ? 'bg-red-50 border-2 border-red-500 focus:ring-red-200 text-red-900' 
              : 'bg-blue-50 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200 text-gray-800'
            }
            focus:outline-none focus:ring-2
            transition-all duration-200
            placeholder-gray-400
          `}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}