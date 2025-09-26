import { FaExclamationTriangle } from "react-icons/fa";

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  rows?: number;
}

export default function TextAreaField({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
  error,
  rows = 3,
}: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
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
