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


describe('PUT /api/bookings/:id', () => {

  it ('should return 401 if no token provided', async () => {
    const res = await request(app)
      .put('/api/bookings/1')
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T12:00:00.000Z',
        status: 'completed',
      });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/未授權/);
  });

  it('should return 403 if not admin', async () => {
    const res = await request(app)
      .put('/api/bookings/1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T12:00:00.000Z',
        status: 'completed',
      });
    
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/禁止訪問/);

  });

  it ('should return 404 if booking not found', async () => {
    const res = await request(app)
      .put('/api/bookings/999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T12:00:00.000Z',
        status: 'completed',
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('預約未找到');    
  });

  it ('should return 400 if the requested booking time is unavailable', async () => {
    const res = await request(app)
      .put('/api/bookings/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T11:00:00.000Z',
        status: 'pending',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('此時段已被預約，請選擇其他時間。');
  });

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

  
  it('should return 200 on successful put', async () => {

    const res = await request(app)
      .put('/api/bookings/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T12:00:00.000Z',
        status: 'completed',
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T12:00:00.000Z',
        status: 'completed',
      });
  });
});

describe('PUT mocked tests',  () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it ('should return 500 if findByPk error', async () => {
    jest.spyOn(Booking, 'findByPk').mockImplementation(() => {
      throw new Error('DB findByPk錯誤');
    });

    const res = await request(app)
      .put('/api/bookings/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T12:00:00.000Z',
        status: 'completed',
      });
    
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('DB findByPk錯誤');
  });

  it ('should return 500 if findOne error', async () => {
    jest.spyOn(Booking, 'findOne').mockImplementation(() => {
      throw new Error('DB findOne錯誤');
    });

    const res = await request(app)
      .put('/api/bookings/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T12:00:00.000Z',
        status: 'completed',
      });
    
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('DB findOne錯誤');
  });


  it('should return 500 if update error', async () => {
    jest.spyOn(Booking, 'update').mockImplementation(() =>{
      throw new Error('DB update錯誤');
    });

    const res = await request(app)
    .put('/api/bookings/1')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T12:00:00.000Z',
        status: 'completed',
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('DB update錯誤');
  });

  it ('should throw validation error when missing required fields', async () =>{
    const mockError = new ValidationError('Validation failed', [
      {message: 'name is required' },
      {message: 'phone must be numeric'},
      {message: 'date must be date'}
    ]);

    jest.spyOn(Booking, 'update').mockRejectedValue(mockError);

    const res = await request(app)
    .put('/api/bookings/1')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
        name: 'testuser',
        phone: '0987654321',
        booking_time: '2025-07-01T12:00:00.000Z',
        status: 'completed',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('驗證錯誤');
      expect(res.body.errors).toContain('name is required');
      expect(res.body.errors).toContain('phone must be numeric');
      expect(res.body.errors).toContain('date must be date');

  });




});
