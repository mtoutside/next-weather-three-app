const path = require('path')

const buildEslintCommand = (fileNames) =>
  `pnpm lint --fix --file ${fileNames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`

module.exports = {
  // 1) Prettier で整形 2) ESLint --fix を実行
  '*.{ts,tsx}': ['prettier --write', (fileNames) => buildEslintCommand(fileNames)],
}

