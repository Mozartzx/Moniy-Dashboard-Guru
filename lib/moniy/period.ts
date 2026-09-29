export const periodOptions = [
  { value: '7-hari', label: '7 hari terakhir', days: 7 },
  { value: '30-hari', label: '30 hari terakhir', days: 30 },
  { value: 'semester', label: 'Semester ganjil', days: 180 },
];

export function periodToRange(period: string) {
  const option = periodOptions.find((item) => item.value === period) ?? periodOptions[0];
  const to = new Date();
  const from = new Date(to.getTime() - option.days * 24 * 60 * 60 * 1000);
  const previousFrom = new Date(from.getTime() - option.days * 24 * 60 * 60 * 1000);
  return { from, to, previousFrom, days: option.days };
}
