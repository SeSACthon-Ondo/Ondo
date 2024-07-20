module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "no-undef": "off",  // 정의되지 않은 변수에 대한 경고를 비활성화
    "no-unused-vars": ["warn", { "vars": "all", "args": "none", "ignoreRestSiblings": false }]  // 사용되지 않는 변수에 대한 경고를 비활성화 또는 경고로 설정
  },
}