import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['src/main.tsx', 'scripts/*.ts', 'vite.config.ts'],
  project: ['src/**/*.{ts,tsx}', 'scripts/*.ts'],
}

export default config
