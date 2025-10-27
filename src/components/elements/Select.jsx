export default function Select({
  className = '',
  selectedValue,
  valueOption,
  onChange,
}) {
  return (
    <select
      className={`select select-bordered max-w-xs ${className}`}
      value={selectedValue}
      onChange={onChange}
    >
      {valueOption.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
