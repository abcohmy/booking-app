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

describe('GET /api/bookings', () => {
  it ('Partial fields are visible without logging in', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(0);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).not.toHaveProperty('phone');
    expect(res.body.data[0]).not.toHaveProperty('status');
  });

  it ('Users can view partial fields', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(0);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).not.toHaveProperty('phone');
    expect(res.body.data[0]).not.toHaveProperty('status');
  });

  it ('Admins can view all fields', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('phone');
    expect(res.body.data[0]).toHaveProperty('status');
  });

  it ('Searching by name will return items containing the keyword', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({name: 'tu'});
    
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('status');
    expect(res.body.data.every(b => b.name.includes('tu'))).toBe(true);
  });

  it ('A date search will exclusively show bookings for that day', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({date: '2025-07-03'});
    
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('status');
    
    expect(res.body.data.every(b => b.booking_time.startsWith('2025-07-03'))).toBe(true);
  });

  it ('Without logging in, applying search parameters will still only show limited fields', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .query({date: '2025-07-03'});

    
    expect(res.status).toBe(200);
    expect(res.body.data[0]).not.toHaveProperty('status');

    expect(res.body.data.every(b => b.booking_time.startsWith('2025-07-03'))).toBe(true);

  });

  it ('Proper pagination with limit and page', async () => {
    const res = await request(app)
    .get('/api/bookings')
    .query({limit: 2, page: 2});
      
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.page).toBe(2);
  });
});

describe('GET mocked tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it ('should return 500 if findAndCountAll error', async () => {
    jest.spyOn(Booking, 'findAndCountAll').mockImplementation(() => {
      throw new Error('DB findAndCountAll錯誤');
    });

    const res = await request(app).get('/api/bookings')
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('DB findAndCountAll錯誤');

  });
});
