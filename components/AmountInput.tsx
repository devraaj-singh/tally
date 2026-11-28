export default function AmountInput({
  value,
  onChange,
  disabled,
  label = "Amount",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <div className="mt-1 flex items-baseline gap-2 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-accent-500">
        <span className="font-display text-3xl text-slate-400">$</span>
        <input
          name="amount"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          required
          disabled={disabled}
          className="w-full bg-transparent font-display text-4xl font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none"
        />
      </div>
    </label>
  );
}
