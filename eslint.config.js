module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'off',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single']
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        test: 'readonly',
        expect: 'readonly'
      }
    }
  }
];
