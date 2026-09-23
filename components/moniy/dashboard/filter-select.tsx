'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FilterSelectProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  icon: LucideIcon;
  compact?: boolean;
  onValueChange: (value: string) => void;
};

export function FilterSelect({ label, value, options, icon: Icon, compact, onValueChange }: FilterSelectProps) {
  return (
    <div className={`topbar-select ${compact ? 'compact' : ''}`}>
      <Select value={value} onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}>
        <SelectTrigger className="topbar-select-trigger" aria-label={label}>
          <span className="topbar-select-icon"><Icon size={18} /></span>
          <span className="topbar-select-copy"><small>{label}</small><SelectValue /></span>
        </SelectTrigger>
        <SelectContent className="topbar-select-content" align="start" sideOffset={8}>
          {options.map((option) => <SelectItem className="topbar-select-item" value={option.value} key={option.value}>{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
