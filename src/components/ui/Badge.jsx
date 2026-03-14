export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-700 text-gray-300',
    brand: 'bg-brand-600/20 text-brand-400 border border-brand-600/30',
    success: 'bg-green-900/30 text-green-400 border border-green-700/30',
    warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30',
    info: 'bg-blue-900/30 text-blue-400 border border-blue-700/30',
  }

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
