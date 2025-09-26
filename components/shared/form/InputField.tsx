import { FaExclamationTriangle } from "react-icons/fa";

interface InputFieldProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  error,
  min,
  max,
  step,
}: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      const numValue = parseFloat(e.target.value);
      onChange(isNaN(numValue) ? 0 : numValue);
    } else {
      onChange(e.target.value);
    }
  };

  // Format value for date inputs - convert ISO string to yyyy-MM-dd
  const getDisplayValue = () => {
    if (type === "date" && typeof value === "string" && value.includes("T")) {
      // Convert ISO string to yyyy-MM-dd format
      const date = new Date(value);
      return date.toISOString().split("T")[0];
    }
    return value;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={getDisplayValue()}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error
            ? "border-red-500 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <FaExclamationTriangle className="mr-1 text-xs" />
          {error}
        </p>
      )}
    </div>
  );
}
