/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

const { createDefaultPreset } = require('ts-jest');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '^#lib/(.*)$': '<rootDir>/src/lib/$1',
    '^#mafia/(.*)$': '<rootDir>/src/lib/mafia/$1',
    '^#util/(.*)$': '<rootDir>/src/lib/util/$1',
  },
  transform: {
    ...createDefaultPreset({
      tsconfig: '<rootDir>/tests/tsconfig.json'
    }).transform
  }
}