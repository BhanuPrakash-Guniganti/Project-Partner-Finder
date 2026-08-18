import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-gray-300 block">
          {label} {required && <span className="text-cyan-400">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <Icon className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
        )}

        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full bg-gray-950 border rounded-2xl py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50 transition-colors ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } ${error ? 'border-red-600' : 'border-gray-800'} ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-400 font-semibold mt-0.5">{error}</p>
      )}
    </div>
  );
};

export default Input;
