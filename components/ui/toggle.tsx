"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 focus-visible:outline-none group disabled:opacity-50"
    >
      {label && (
        <span className="text-lg text-gray-700 font-medium select-none">{label}</span>
      )}
      <div
        className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
          checked ? "bg-primary" : "bg-gray-200"
        }`}
      >
        <div
          className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </div>
    </button>
  );
}
