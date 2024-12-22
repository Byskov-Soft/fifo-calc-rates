import z from 'zod'
import { ISO8601DateString, type Year } from './date.ts'

// Commandline arguments and usage
export interface Usage {
  option: string
  arguments: string[]
}

export interface RateGeneratorConfig {
  conversionType: string
  year: Year
  input: string
  output: string
}

export type RateGeneratorFunction = (config: RateGeneratorConfig) => Promise<void>

// RateRecord
export const RateRecord = z.record(ISO8601DateString, z.number())
export type RateRecord = z.TypeOf<typeof RateRecord>
