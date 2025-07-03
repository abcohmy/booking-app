
const request = require('supertest');
const app = require('../app');
const {setupTestDb, sequelize} = require('./setupTestDB');

const User = require('../models/userModel');

beforeAll(async () => {
  await setupTestDb();
});

afterAll (async () => {
  await sequelize.close();
});

describe('GET /api/auth/check-username', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should return available: true if username not found', async () => {

    const res = await request(app)
      .get('/api/auth/check-username')
      .query({ username: 'test'});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ available: true});
  });

  it('should return available: false if username exists', async () => {
    
    const res = await request(app)
      .get('/api/auth/check-username')
      .query({username: 'testuser'});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({available: false});
  });

  it ('should return 500 if DB error occurs', async () => {
    jest.spyOn(User, 'findOne').mockImplementation(() => {
      throw new Error('DB爆炸');
    });

    const res = await request(app)
      .get('/api/auth/check-username')
      .query({username: 'testuser'});

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('伺服器錯誤:DB爆炸');
  });
});