const request = require('supertest');
const app = require('../app');
const {setupTestDb, sequelize} = require('./setupTestDB');

const User = require('../models/userModel');

beforeAll(async () => {
  await setupTestDb();
});

afterAll ( async () => {
  await sequelize.close();
});

describe('POST /api/auth/register', () => {
  

  it ('should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser123',
        password: 'testpass',
        role: 'user'
      });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('使用者註冊成功。');
      expect(res.body.user).toMatchObject({
        user_id: expect.any(Number),
        username: 'testuser123',
        role: 'user'
      });
  });

  it('should fail validation with username existed', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'testpass',
        role: 'user'
      });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('該使用者名稱已被使用。');
  });

  it ('should fail validation with too short username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'te',
        password: 'testpass',
        role: 'user'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('使用者名稱最少要3個字元');
  });

  it ('should fail validation with empty username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: '',
        password: 'testpass',
        role: 'user'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('使用者名稱不能為空');
  });

  it ('should fail validation without username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        password: 'testpass',
        role: 'user'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('使用者名稱是必填欄位');
  });

  it ('should fail validation with too short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser123',
        password: 'wrong',
        role: 'user'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('密碼最少要8個字元');
  });

  it ('should fail validation with empty password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser123',
        password: '',
        role: 'user'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('密碼不能為空');
  });

  it ('should fail validation without password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser123',
        role: 'user'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('密碼是必填欄位');
  });

  it ('should fail validation with wrong status', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser123',
        password: 'userpass',
        role: 'pass'
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('使用者類別(role)只能是user, admin');
  });

});

describe('POST /api/auth/register mocked', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should return 500 when findOne throws', async () => {
    jest.spyOn(User, 'findOne').mockImplementation(() => {
      throw new Error('findOne錯誤');
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser123',
        password: 'testpass',
        role: 'user'
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('伺服器錯誤:findOne錯誤');

  });

  it('should return 500 when create throws', async () => {
    jest.spyOn(User, 'create').mockImplementation(() => {
      throw new Error('create錯誤');
    });
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser1234',
        password: 'testpass',
        role: 'user'
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('伺服器錯誤:create錯誤');
  });
});