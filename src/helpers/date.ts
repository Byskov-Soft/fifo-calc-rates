import { addDays, isAfter, isBefore, isEqual, parseISO } from 'date-fns'
import z from 'zod'

// Year
export const Year = z.any().transform((v) => {
  const value = typeof v === 'number' ? v : parseInt(v)

  if (value < 2000 || value > 2100) {
    throw new Error('Invalid year')
  }

  return value
})

export type Year = z.TypeOf<typeof Year>

// ISO8601DateString
export const ISO8601DateString = z.string().refine(
  (arg): boolean => {
    if (parseISO(arg).toString() === 'Invalid Date') {
      console.error(`Parsing of '${arg}' as ISO8601 date failed`)
      return false
    }

    return true
  },
  { message: `Value is not a valid date` },
)

export type ISO8601DateString = z.TypeOf<typeof ISO8601DateString>

/**
 * Turns a date string into a Date object
 * without turning it into local time
 * @param {string} date
 * @returns {Date}
 */
export const utcDateStringToISODate = (date: string): Date => {
  const d = date.endsWith('Z') ? date : `${date}Z`
  return new Date(d)
}

/**
 * Turn a date string into an ISO string
 * without turning it into local time
 * @param {string} date
 * @returns {string}
 */
export const utcDateStringToISOString = (date: string): string => {
  return utcDateStringToISODate(date).toISOString()
}

/**
 * Converts a Date object to a UTC date string
 * without turning it into local time
 * @param {Date} date
 * @returns {string}
 */
export const dateToUtcString = (date: Date): string => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  // YYYY-MM-DD HH:mm:ss
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/*
    Is a date within a buffer period of days before the start of the year?
*/
export const isBufferDateBeforeYearStart = (date: string, year: string, numberOfDays: number) => {
  const firstDateOfYear = new Date(year)
  const providedDate = utcDateStringToISODate(date)
  const dateBeforeYearStart = addDays(firstDateOfYear, -numberOfDays)

  // Keep these log lines if debugging is needed
  // console.log('first day of year:', firstDateOfYear.toISOString())
  // console.log(`${numberOfDays} days before:`, dateBeforeYearStart.toISOString())
  // console.log('provided date:', date, providedDate.toISOString())

  // console.log(
  //     `${providedDate.toISOString()} is before ${firstDateOfYear.toISOString()} ? `,
  //     isBefore(providedDate, firstDateOfYear),
  // )

  // console.log(
  //     `${providedDate.toISOString()} is after ${dateBeforeYearStart} ? `,
  //     isAfter(providedDate, dateBeforeYearStart) || isEqual(providedDate, dateBeforeYearStart),
  // )

  const isValid = isBefore(providedDate, firstDateOfYear) &&
    (isAfter(providedDate, dateBeforeYearStart) || isEqual(providedDate, dateBeforeYearStart))

  return isValid
}

/*
    Get a range of dates from start to end (both included)
*/
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = []

  const currentDate = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  ) // Start at midnight UTC

  const endDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())) // End at midnight UTC

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate)) // Add a copy of the current date

    // Move to the next day explicitly in UTC
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  return dates
}
