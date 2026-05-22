module.exports = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^@letterwise/progress/domain$': '<rootDir>/../../libs/progress/domain/src/index.ts',
    '^@letterwise/progress/contracts$': '<rootDir>/../../libs/progress/contracts/src/index.ts',
    '^@letterwise/scripts/domain$': '<rootDir>/../../libs/scripts/domain/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
};
