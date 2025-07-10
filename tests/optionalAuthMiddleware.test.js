const jwt = require('jsonwebtoken');
const {optionalAuthMiddleware} = require('../middleware/authMiddleware');
const User = require('../models/userModel');

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret123';
});

describe('optionalAuthMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}};
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should jump to next without token', async () => {
    await optionalAuthMiddleware(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should jump to next with invalid token', async () => {
    req.headers.authorization = 'Bearer badtoken';
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await optionalAuthMiddleware(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('Should set req.user with valid token', async () => {
    req.headers.authorization = 'Bearer goodtoken';
    const fakeUser = {user_id: 123, username: 'Test', role:'user'};

    jest.spyOn(jwt, 'verify').mockReturnValue({user_id:123});
    jest.spyOn(User, 'findByPk').mockResolvedValue(fakeUser);

    await optionalAuthMiddleware(req, res, next);
    expect(User.findByPk).toHaveBeenCalledWith(123, {
      attributes: {exclude: ['password']},
    });

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledTimes(1);

  });

  it('Should skip and not crash if auth header is malformed', async() => {
    req.headers.authorization = 'Token wrongprefix';

    await optionalAuthMiddleware(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('Should continue if token is valid but user not found', async () => {
    req.headers.authorization = 'Bearer goodtoken';
    jest.spyOn(jwt, 'verify').mockReturnValue({user_id:456});
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);

    await optionalAuthMiddleware(req, res, next);
    expect(req.user).toBeUndefined();
    expect(User.findByPk).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
  
});