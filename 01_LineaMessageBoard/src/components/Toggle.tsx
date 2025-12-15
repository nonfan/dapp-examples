type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

export default function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm text-gray-600"
    >
      <span
        className={`inline-block w-8 h-4 rounded-full relative transition ${
          checked ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
      {label}
    </button>
  );
}
