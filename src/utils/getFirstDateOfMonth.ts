// getFirstDateOfMonth.ts
export function getFirstDateOfMonth(dateInput: Date | string): Date {
  // Convert to Date if a string is provided
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getFirstDates(date1: Date | string, date2: Date | string): Date[] {
  return [getFirstDateOfMonth(date1), getFirstDateOfMonth(date2)];
}