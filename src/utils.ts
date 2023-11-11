import { calendar_v3 } from 'google-calendar-subscriptions'

/**
 * Checks if the given object is a valid Google Calendar subscription.
 */
export const instanceOfSubscription = (object: Record<string, any>): object is calendar_v3.Schema$Subscription =>
  'calendarId' in object &&
  'description' in object &&
  'fn' in object &&
  'id' in object &&
  'owner' in object &&
  'summary' in object &&
  'url' in object

/**
 * Convert a string to an array.
 */
export const toArray = (input: string, symbol = ','): string[] => input ? input.split(symbol) : []
