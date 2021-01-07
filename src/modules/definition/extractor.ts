import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import { TsrvConfig } from '../../config'

async function buildTypes({ root, distDir }: TsrvConfig) {
  const extractorConfigPath = path.join(root, 'api-extractor.json')
  await fs.writeJSON(extractorConfigPath, {
    $schema: 'https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json',
    mainEntryPointFilePath: `${distDir}/__temp__/index.d.ts`,
    apiReport: {
      enabled: false
    },
    docModel: {
      enabled: false
    },
    dtsRollup: {
      enabled: true,
      publicTrimmedFilePath: `${distDir}/index.d.ts`
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
  await fs.remove(path.join(distDir, '__temp__'))
  if (extractorResult.succeeded) {
    console.log(chalk.bold(chalk.green(`API Extractor completed successfully.`)))
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    )
  }
}

export default buildTypes
