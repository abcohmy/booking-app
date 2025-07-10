const request = require('supertest');
const app = require('../app');
const {setupTestDb, sequelize} = require('./setupTestDB');

const User = require('../models/userModel');




beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret123';
  await setupTestDb();
});

afterAll (async () => {
  await sequelize.close();

});


describe('不使用mock的login token整合測試', () => {

  beforeEach(() => {
    //確保不配其他測試檔案有mock汙染
    jest.resetModules();
  });
  
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

    it('should fail validation with missing username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: '',
        password: 'whatever'
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
  });

});

