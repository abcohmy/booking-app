const {authorizeRoles} = require('../middleware/authMiddleware');

describe('authorizeRoles', () => {
  let req, res, next;
  
  const buildRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  }

  beforeEach(() => {
    req = {user: {}};
    res = buildRes();
    next = jest.fn();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should reject without logging in', async () => {
    const middleware = authorizeRoles('admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({message: expect.stringMatching(/禁止訪問/)})
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject without admin role', async () => {
    req.user.role = 'user';
    const middleware = authorizeRoles('admin');
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({message: expect.stringMatching(/禁止訪問/)})
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('Should pass with admin role', async () => {
    req.user.role = 'admin';
    const middleware = authorizeRoles('admin');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

});