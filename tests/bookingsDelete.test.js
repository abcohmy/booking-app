
const request = require('supertest');
const app = require('../app');
const Booking = require('../models/bookingModel');
const jwt = require('jsonwebtoken');
const { setupTestDb, sequelize } = require('./setupTestDB');

const admin = { user_id: 2, role: 'admin'};
const user = { user_id: 1, role: 'user'};

const adminToken = jwt.sign(admin, process.env.JWT_SECRET, { expiresIn: '1h'});
const userToken = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '1h'});

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret123';
  await setupTestDb();
});

afterAll(async () => {
  await sequelize.close();
});


describe('DELETE /api/bookings/:id', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it ('should return 401 if no token provided', async () => {
    const res = await request(app).delete('/api/bookings/1');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('未授權，缺少格式錯誤的Token');
  });

  it ('should return 403 if not admin', async () => {
    const res = await request(app)
      .delete('/api/bookings/1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('禁止訪問: 您沒有此權限。');
  });

  it('should return 404 if booking not found', async () => {
    const res = await request(app)
      .delete('/api/bookings/999')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('預約未找到或已被刪除' );
  });

  it('should return 200 on successful delete', async () => {
    const res = await request(app)
      .delete('/api/bookings/1')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('預約已刪除');
  });

  it('should return 500 if DB error', async () => {
    jest.spyOn(Booking, 'destroy').mockImplementation(() => {
      throw new Error('DB Delete錯誤');
    });

    const res = await request(app)
      .delete('/api/bookings/1')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('DB Delete錯誤');
  })
});