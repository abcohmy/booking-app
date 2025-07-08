const request = require('supertest');
const app = require('../app');
const Booking = require('../models/bookingModel');
const jwt = require('jsonwebtoken');
const {setupTestDb, sequelize} = require('./setupTestDB');
const { ValidationError } = require('sequelize');

const admin = { user_id: 2, role: 'admin' };
const user = { user_id: 1, role: 'user' };

const adminToken = jwt.sign(admin, process.env.JWT_SECRET, {expiresIn: '1h'});
const userToken = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '1h'});

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret123';
  await setupTestDb();
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/bookings', () => {

it('should fail validation with unavailable status', async () => {
    const res = await request(app)
      .put('/api/bookings/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T12:00:00.000Z',
        status: 'None',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('狀態類別只能是 pending, completed, cancelled。');


    });


  it ('should fail validation with empty name', async () => {
    const res = await request(app)
    //一定要小寫
      .post('/api/bookings')
      .send({
        name: '',
        phone: '0987654321',
        booking_time: '2025-07-01T11:00:00.000Z',
      });



      expect(res.status).toBe(400);
      expect(res.body.message).toBe('預訂者姓名不能為空');
  });



  it ('should fail validation without name', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        phone: '0987654321',
        booking_time: '2025-07-01T11:00:00.000Z',
      });

      console.log('>>> sending POST request');


      expect(res.status).toBe(400);
      expect(res.body.message).toBe('預訂者名稱是必填欄位');
  });

  it ('should fail validation with unavailable phone pattern', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        name: 'testuser',
        phone: '666',
        booking_time: '2025-07-01T11:00:00.000Z',
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('手機號碼格式錯誤，必須09開頭共10碼數字');
  });

  it ('should fail validation without phone', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        name: 'testuser',
        booking_time: '2025-07-01T11:00:00.000Z',
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('手機號碼必填欄位');
  });

  it ('should fail validation with unavailable date', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '20250229',
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('預約時間必須是有效日期格式');
  });

  it ('should fail validation without date', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        name: 'testuser',
        phone: '0987654321',

      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('預約時間是必填欄位');
  });



  it('should return 400 if the requested booking time is unavailable', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T11:00:00.000Z',
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('此時段已被預約，請選擇其他時間。');
  });

  it('should return 200 on successful post with profile_id', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-06-29T11:00:00.000Z',
      });  
    
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'testuser',
      phone: '0987654321',
      booking_time: '2025-06-29T11:00:00.000Z',
      status: 'pending',
      profile_id: 1,
    });

  });

  it('should return 200 on successful post', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        name: 'testuser3',
        phone: '0915815815',
        booking_time: '2025-06-27T11:00:00.000Z',
      });  
    
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'testuser3',
      phone: '0915815815',
      booking_time: '2025-06-27T11:00:00.000Z',
      status: 'pending',
      profile_id: null,
    });

  });

});

describe('POST mocked tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it ('should return 500 if findOne error', async () => {
    jest.spyOn(Booking, 'findOne').mockImplementation(() => {
      throw new Error('DB findOne錯誤');
    });

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-06-28T11:00:00.000Z',
      });  
    
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('DB findOne錯誤');

  });

  it('should return 500 if create error', async () => {
    jest.spyOn(Booking, 'create').mockImplementation(() => {
      throw new Error('DB create錯誤');
    });

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-06-28T11:00:00.000Z',
      });  

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('DB create錯誤');
  });

  it ('should throw validation error when missing required fields', async () => {
    //sequelize 驗證失敗的錯誤
    const mockError = new ValidationError('Validation failed', [
      {message: 'name is required' },
      {message: 'phone must be numeric'},
      {message: 'date must be date type'}
    ]);
    /*
    //mockImplementation: 一般同步邏輯錯誤
        
    //mockRejectedValue: Sequelize async 錯誤
    */
    jest.spyOn(Booking, 'create').mockRejectedValue(mockError);
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-06-28T11:00:00.000Z',
      });  
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('驗證錯誤');
    expect(res.body.errors).toContain('name is required');
    expect(res.body.errors).toContain('phone must be numeric');
    expect(res.body.errors).toContain('date must be date type');  
  });

});