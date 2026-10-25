'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FormSelectProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
  onValueChange: (value: string) => void;
};

/** Dropdown formulir dengan gaya yang sama seperti Kelas dan Periode di topbar. */
export function FormSelect({ label, value, options, disabled, className, onValueChange }: FormSelectProps) {
  return (
    <Select items={options} value={value} disabled={disabled} onValueChange={(next) => next && onValueChange(next)}>
      <SelectTrigger className={`form-select-trigger ${className ?? ''}`} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="topbar-select-content" align="start" sideOffset={8}>
        {options.map((o) => <SelectItem className="topbar-select-item" value={o.value} key={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
