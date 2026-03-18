import type { BookingStatus, BookingUrgency } from '@prisma/client';

export const STATUS_COLORS: Record<BookingStatus, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  MATCHING: 'bg-orange-100 text-orange-800',
  MATCHED: 'bg-blue-100 text-blue-800',
  PROVIDER_EN_ROUTE: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  REQUESTED: 'Requested',
  MATCHING: 'Finding Provider',
  MATCHED: 'Provider Matched',
  PROVIDER_EN_ROUTE: 'Provider En Route',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const URGENCY_MULTIPLIERS: Record<BookingUrgency, number> = {
  EMERGENCY: 1.5,
  TODAY: 1.2,
  SCHEDULED: 1.0,
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

export const PT_DISTRICTS = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
] as const;
