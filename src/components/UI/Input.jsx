import React from "react";

const Input = ({
  type = "text",
  value,
  onChange,
  placeholder = "",
  className = "",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 focus:bg-white focus:border-rose-500  outline-none disabled:opacity-50 disabled:pointer-events-none";

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};

export default Input;
