  /*
  mock一定要在所有Require之前不然require的途中跑了多少require其他function很難抓
  resetModules一定要在mock之前 不然剛設的會被全清掉
  */
  jest.resetModules();
  jest.mock('../utils/token', () => ({
    __esModule: true,
    generateToken: jest.fn()
  }));

const request = require('supertest');
const {setupTestDb, sequelize} = require('./setupTestDB');

const User = require('../models/userModel');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


let generateToken;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret123';
  await setupTestDb();



  app = require('../app');
  generateToken = require('../utils/token').generateToken;
  console.log('mock?',jest.isMockFunction(generateToken));// 應該是 true

});

afterAll (async () => {
  await sequelize.close();

});

describe('使用mock的整合測試', () => {


  afterEach(() => {
    //只清呼叫紀錄
    jest.clearAllMocks();
    //把jest.spyOn()的函式還原成原本的函式，不換的話就會保持jest.spyOn()過後的函式
     jest.restoreAllMocks();  
  });

  it('should return 500 when User.findOne throws', async () => {
    //module自帶的function或函式使用spyOn
    jest.spyOn(User, 'findOne').mockImplementation(() => {
      throw new Error('DB連線失敗');
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password:'testpass123'});
    

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('伺服器錯誤:DB連線失敗');

  });

  it('should return 500 when matchPassword throws', async () => {
    //包進model實例的方法(雖自創)，仍然需用spyOn
    jest.spyOn(User.prototype, 'matchPassword').mockImplementation(() => {
  throw new Error('match 錯了');
});

    const res = await request(app)
      .post('/api/auth/login')
      .send( { username: 'testuser', password: 'testpass123' });
    


    expect(res.status).toBe(500);
    expect(res.body.message).toBe('伺服器錯誤:match 錯了');
  });

  it('should return valid token payload on success', async () => {
    //自製function不用，寫在jest.mock...記得寫最頂端
    generateToken.mockImplementation((user_id, role) => {
      return jwt.sign({user_id, role}, process.env.JWT_SECRET, {expiresIn: '1h'});
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpass123'});

    expect(res.status).toBe(200);
    //note: 這裡只檢查token結構，不進行驗證
    const decoded = jwt.decode(res.body.token);
    expect(decoded).toMatchObject({
      user_id: expect.any(Number),
      role: expect.stringMatching(/^(user|admin)$/)
    });
  });

});