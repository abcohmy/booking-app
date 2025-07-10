module.exports = {

  setupFiles: ["<rootDir>/jest.globals.js"],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],

  testEnvironment: 'jsdom',           // ✅ 為了跑 DOM
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',      // ✅ 讓 .js/.jsx 都吃 babel
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-router-dom)/)', // 這行關鍵
  ],

  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  moduleFileExtensions: ['js', 'jsx'],
};