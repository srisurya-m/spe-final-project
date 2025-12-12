// frontend/jest.config.cjs
module.exports = {
  // Use the installed JSDOM environment for browser simulation
  testEnvironment: 'jest-environment-jsdom', 

  // Babel needs to process all React and TypeScript files
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest', 
  },

  // Tells Jest where to find the tests
  testMatch: [
    "**/src/tests/**/*.test.{ts,tsx,js,jsx}"
  ],

  // Mock CSS/Assets so Jest doesn't try to read them
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  
  // Set up file for @testing-library extensions (like .toBeInTheDocument)
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'], 
};