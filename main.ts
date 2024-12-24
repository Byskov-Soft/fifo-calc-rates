import { generateUsdEurRates } from './src/createUsdEurRates.ts'
import {
  getArgAt,
  getOptValue,
  parseAppOptions,
  setUsage,
  showUsageAndExit,
} from './src/helpers/cmdOptions.ts'
import { Year } from './src/helpers/date.ts'

import type { RateGeneratorConfig, RateGeneratorFunction, Usage } from './src/helpers/misc.ts'

enum SOURCE {
  ECB_EUR = 'ecb-eur',
}

const ecbExample = [
  'Example: fifo-calc-rates ecb-eur --year 2024 --input ./test-data/usd-eur.xml --output ./usd-eur-rates-2024.json',
  '',
  '  ecb-eur:',
  '    Download the file from https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html\n',
].join('\n')

export const usage: Usage = {
  option: `${Object.values(SOURCE).join(' | ')}`,
  arguments: [
    '--year   <year>             : Year for which the rates are being created',
    '--input  <input-file-path>  : An input file matching the specified source',
    '--output <output-file-path> : An output JSON file to write the rates to',
  ],
}

parseAppOptions()
setUsage(usage)

let generate: RateGeneratorFunction | null = null
const arg = getArgAt(0) ?? ''

switch (arg.toString().toLocaleLowerCase()) {
  case SOURCE.ECB_EUR: {
    generate = generateUsdEurRates
    break
  }
  default: {
    showUsageAndExit({ extras: ecbExample, exitWithError: true })
  }
}

const year = getOptValue('year') as string
const input = getOptValue('input') as string
const output = getOptValue('output') as string
const optionsValidated = year && input && output

if (!optionsValidated) {
  showUsageAndExit()
} else {
  const config: RateGeneratorConfig = {
    conversionType: arg as SOURCE,
    year: Year.parse(year),
    input,
    output,
  }

  await generate!(config)
  console.log(`\nOutput file written to ${output}\n`)
}
