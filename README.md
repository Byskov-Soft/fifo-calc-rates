# Fifo-calc-rates

A simple commandline tool for creating JSON files containing currencey rates for every day in a year
(or until the current day in the current year).

This tool is part of the `fifo-calc` crypto suite, which consists of the following tools.

| tool                  | description                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `fifo-calc`           | Creates FIFO reports based on buy and sell transactions to be used for reporting capital gains.                  |
| `fifo-calc-converter` | Converts transaction (CSV) files from various crypto exchanges, to a format that can be imported by `fifo-calc`. |
| `fifo-calc-rates`     | Creates currency rate files to be used `fifo-calc-converter`.                                                    |

## When would I need this tool?

If you need to convert CSV files with `fifo-calc-converter` and your transactions are in a different
currency than your taxable currency.

**Example:** The CSV files you want to convert has values in USD but you need to report taxes in EUR.

In this case you need to provide the USD cost of one EUR of each transaction date.

## When would I NOT need this tool?

When the exchange and taxable currency is the same.

If, for example, transactions and the taxable currency are both in USD, `fifo-calc-converter`
supports using a fixed conversion rate of `1` (no conversion is done).

## Installation

- Install the [Deno runtime](https://deno.com/)

  If you are on Linux or Mac, using [DVM](https://deno.land/x/dvm@v1.9.1) (Deno version manager) is
  recommended

- Clone this [GitHub repository](https://github.com/Byskov-Soft/fifo-calc-rates.git):

  `git clone https://github.com/Byskov-Soft/fifo-calc-rates.git`

- Compile the binary:
  ```
  cd fifo-calc-rates
  deno task compile
  ```
- Copy the compiled binary to a directory in your path

  For example: `sudo cp ./fifo-calc-rates /usr/local/bin/`

## Usage

```
fifo-calc-convert ecb-eur <options>

Options:
 --year   <year>             : Year for which the rates are being created

 --input  <input-file-path>  : An input file matching the specified source

 --output <output-file-path> : An output JSON file to write the rates to

Example: fifo-calc-rates ecb-eur --year 2024 --input ./test-data/usd-eur.xml --output ./usd-eur-rates-2024.json
```

**Note:** `ecb-eur` refers to a
[downloadable XML file](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/usd.xml)
provided by the European Central Bank. The file is updated daily with latest USD to EUR rate.
Currently `USD-EUR` is the only currency pair supported by `fifo-calc-rates`. More may be added in
the future, but it is not certain, as historic data like this is not always available for free.

After running the tool, the output file should contain JSON having the following structure:

```json
{
  "2024-01-01": 1.105,
  "2024-01-02": 1.0956,
  "2024-01-03": 1.0919,
  "2024-01-04": 1.0953,
  "2024-01-05": 1.0921,
  "2024-01-06": 1.0921,
  "2024-01-07": 1.0921,
  "2024-01-08": 1.0946,
  "2024-01-09": 1.094,
  "2024-01-10": 1.0946,
  "2024-01-11": 1.0987,
  "2024-01-12": 1.0942,
  "2024-01-13": 1.0942,
  "etc":
}
```
