import defaultConfig from '@commitlint/config-conventional'
import type { UserConfig } from '@commitlint/types'
import { RuleConfigSeverity } from '@commitlint/types'

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      [...defaultConfig.rules['type-enum'][2], 'deps'],
    ],
  },
}

export default Configuration
