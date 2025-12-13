type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

export default function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition ${
        checked
          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
          : "border-gray-300 bg-white text-gray-600"
      }`}
    >
      <span
        className={`inline-block w-8 h-4 rounded-full relative transition ${
          checked ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
      {label ? <span className="text-xs">{label}</span> : null}
    </button>
  );
}
