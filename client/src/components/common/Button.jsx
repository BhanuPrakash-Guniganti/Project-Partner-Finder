import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon: Icon,
  onClick,
  type = 'button',
  className = ''
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-4 py-2.5 text-xs font-bold rounded-2xl',
    lg: 'px-6 py-3.5 text-sm font-bold rounded-2xl'
  };

  const variantStyles = {
    primary: 'gradient-btn text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25',
    secondary: 'bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800',
    outline: 'bg-transparent border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40',
    danger: 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
