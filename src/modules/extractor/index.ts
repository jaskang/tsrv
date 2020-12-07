import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import { TsrvConfig } from '../../config'

async function buildTypes({ root, distDir }: TsrvConfig) {
  const extractorConfigPath = path.join(root, 'api-extractor.json')
  await fs.writeJSON(extractorConfigPath, {
    $schema: 'https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json',
    mainEntryPointFilePath: `<projectFolder>/${distDir}/__types__/index.d.ts`,
    apiReport: {
      enabled: false
    },
    docModel: {
      enabled: false,
      apiJsonFilePath: `<projectFolder>/${distDir}/index.api.json`
    },
    dtsRollup: {
      enabled: true,
      untrimmedFilePath: `<projectFolder>/${distDir}/index.d.ts`
    },
    tsdocMetadata: {
      enabled: false
    },
    messages: {
      compilerMessageReporting: {
        default: {
          logLevel: 'warning'
        }
      },
      extractorMessageReporting: {
        default: {
          logLevel: 'warning',
          addToApiReportFile: true
        },
        'ae-missing-release-tag': {
          logLevel: 'none'
        }
      },
      tsdocMessageReporting: {
        default: {
          logLevel: 'none'
        }
      }
    }
  })

  const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath)
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true
  })
  await fs.remove(extractorConfigPath)
  await fs.remove(path.join(root, distDir, '__types__'))
  if (extractorResult.succeeded) {
    console.log(chalk.bold(chalk.green(`API Extractor completed successfully.`)))
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    )
    process.exitCode = 1
  }
}

export default buildTypes
