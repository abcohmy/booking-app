module.exports = {
  testMatch: ['<rootDir>/tests/*.test.js'],  // 只測這個路徑的檔案
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setupEnv.js']
};