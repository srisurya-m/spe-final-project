// backend/jest.config.js
module.exports = {
    // Use ts-jest to process TypeScript files
    preset: 'ts-jest', 
    
    // Node is the correct environment for backend tests
    testEnvironment: 'node', 
    
    // Tell Jest where to find the tests
    testMatch: [
      "**/src/tests/**/*.test.ts"
    ],
    
    // This helps Jest use the correct tsconfig file
    globals: {
      'ts-jest': {
        tsconfig: './tsconfig.json',
      },
    },
  };