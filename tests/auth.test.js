const request = require('supertest');
const app = require('../app');
const {initializeDb, sequelize} = require('../db');

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

/*
  jest測試專用函式
  beforeEach 每個測試之前執行
  afterEach
  beforeAll 所有測試之前執行一次
  afterAll
*/

beforeAll(async () => {
  await initializeDb();

  await User.destroy({ where: {} });

  const hashedPassword = 'testpass123';
  await User.create({
    user_id: 1,
    username: 'testuser',
    password: hashedPassword,
    role: 'user'
  });
});

afterAll (async () => {
  await sequelize.close();

});

//測試login router
describe('POST /api/auth/login', () => {
  //登入成功時
  it ('should login successfully with valid credentials', async () =>{
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpass123'
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        username: 'testuser',
        role: 'user'
      });
  });

  it ('should fail login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpass'
      });
    
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', '無效的密碼');
  });

  it('should fail login with non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nosuchuser',
        password: 'whatever'
      });
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', '無效的帳號。');

  });

  it('should fail validation with missing username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'testpass123'
      });
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

});