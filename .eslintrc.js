module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: '16.13',
    },
  },
  plugins: ['react', '@typescript-eslint'],
  extends: [
    'airbnb-typescript',
    'plugin:react/recommended',
  ],
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/indent': 'off',
    'object-curly-newline': 'off',
    'arrow-body-style': 'off',
    'operator-linebreak': 'off',
    '@typescript-eslint/quotes': 'off',
    'implicit-arrow-linebreak': 'off',
    'function-paren-newline': 'off',
    'no-confusing-arrow': 'off',
    'react/prop-types': [
      1,
      {
        ignore: ['context', 'tracking'],
      },
    ],
    'import/prefer-default-export': 'off',
    'import/no-named-as-default': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-boolean-value': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/destructuring-assignment': 'off',
    'max-len': ['warn', {
      code: 120,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      ignoreComments: true,
    }],
    'no-console': ['warn', { allow: ['error'] }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
      },
    },
  ],
};
