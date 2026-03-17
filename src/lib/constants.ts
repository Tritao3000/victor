import type { BookingStatus } from '@prisma/client';

export const STATUS_COLORS: Record<BookingStatus, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  REQUESTED: 'Requested',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const PLUMBING_SPECIALTIES = [
  'Leak Repair',
  'Drain Cleaning',
  'Water Heater Installation',
  'Pipe Installation',
  'Toilet Repair',
  'Faucet Installation',
  'Sump Pump Services',
  'Gas Line Services',
] as const;

export const ELECTRICAL_SPECIALTIES = [
  'Outlet Installation',
  'Light Fixture Installation',
  'Circuit Breaker Repair',
  'Ceiling Fan Installation',
  'Electrical Panel Upgrade',
  'Wiring Repair',
  'Generator Installation',
  'Smart Home Installation',
] as const;

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;
