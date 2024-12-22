import { addDays, isBefore } from 'date-fns'
import { XMLParser } from 'fast-xml-parser'
import {
  getDateRange,
  isBufferDateBeforeYearStart,
  utcDateStringToISODate,
  type Year,
} from './helpers/date.ts'
import type { RateGeneratorConfig } from './helpers/misc.ts'

type RateTable = Record<string, number>

const parseDatesAndRateXML = (xmlString: string, year: Year): {
  records: RateTable
  bufferRate: number
  lastDate: Date
} => {
  const yearStr = year.toString()
  // Initialize the parser with options
  const parser = new XMLParser({
    ignoreAttributes: false, // Keep attributes
    attributeNamePrefix: '', // Remove prefix from attribute keys
  })

  // Parse XML to JSON
  const parsed = parser.parse(xmlString)

  // Navigate to the relevant part of the parsed JSON
  const observations = parsed.CompactData?.DataSet?.Series?.Obs

  // Convert the observations into the desired format
  const foundDatesAndRates: RateTable = {}
  let bufferRate = 0

  if (Array.isArray(observations)) {
    for (const obs of observations) {
      const date = obs.TIME_PERIOD as string
      const rate = obs.OBS_VALUE as string
      const obsYear = date.substring(0, 4)

      // We want to add a buffer day from the previous year
      // in case we need to fill in missing rates at the beginning of the year
      if (date.startsWith(yearStr)) {
        foundDatesAndRates[date] = parseFloat(rate)
        continue
      }

      // We save a buffer rate up to 5 times, to make sure we get past the
      // holidays and an eventual weekend (no entries exist for those)
      if (obsYear < yearStr && isBufferDateBeforeYearStart(date, yearStr, 5)) {
        bufferRate = parseFloat(rate)
      }
    }
  }

  const dates = Object.keys(foundDatesAndRates).sort((a, b) => (a > b ? 1 : -1))
  const lastDate = utcDateStringToISODate(dates[dates.length - 1])
  return { records: foundDatesAndRates, bufferRate, lastDate }
}

const addMissingDays = (
  records: RateTable,
  bufferRate: number,
  lastDate: Date,
  year: Year,
): Record<string, number> => {
  const yearStr = year.toString()
  // Add rates to the rate table.
  // If a day is missing (weekend + public holidays) the last known rate is used.
  let currentRate = bufferRate
  const rateTable: Record<string, number> = {}

  getDateRange(new Date(year.toString()), lastDate).forEach((d) => {
    const index = d.toISOString().substring(0, 10)

    if (records[index] !== undefined) {
      currentRate = records[index]
    }

    rateTable[index] = currentRate
  })

  // Add the missing days at the end of a past year
  //  OR
  // Add the missing days up until today in the current year
  const currentYearStr = new Date().getFullYear().toString()
  const isCurrentYearReport = yearStr === currentYearStr

  const targetDateOfYear = isCurrentYearReport ? new Date() : new Date(Date.UTC(year, 12 - 1, 31)) // Months are 0-indexed

  let daysAdded = 0

  if (isBefore(lastDate, targetDateOfYear)) {
    const extraDates = getDateRange(addDays(lastDate, 1), targetDateOfYear)
    daysAdded = extraDates.length

    extraDates.forEach((d) => {
      const index = d.toISOString().substring(0, 10)
      rateTable[index] = currentRate
    })
  }

  if (daysAdded) {
    const message: string[] = ['']

    if (isCurrentYearReport) {
      message.push(
        `Added the last known rate for ${daysAdded} days up until the current date.`,
        'Consider importing a newer XML file to get the latest rates.',
      )
    } else {
      message.push(
        `Added the last known rate for ${daysAdded} days at the end of the year ${yearStr}.`,
      )
    }

    message.push(
      'Note that weekends and some common public holidays are always',
      'filled with the last known rate.',
    )

    console.log(message.join('\n'))
  }

  return rateTable
}

export const generateUsdEurRates = async (config: RateGeneratorConfig): Promise<void> => {
  const xmlData = await Deno.readTextFile(config.input)

  try {
    // Parse the XML data and convert it to JSON
    const { records, bufferRate, lastDate } = parseDatesAndRateXML(xmlData, config.year)

    const rateTable = addMissingDays(
      records,
      bufferRate,
      lastDate,
      config.year,
    )
    const jsonData = JSON.stringify(rateTable, null, 2)

    // Write the JSON data to a file
    await Deno.writeTextFile(config.output, jsonData)
  } catch (error) {
    console.error('\nError parsing XML:', error)
  }
}
