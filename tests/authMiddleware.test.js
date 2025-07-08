
/*
  jest.fn: 可追蹤，可加其他函數控制其返回值
  本身不返回任何值，為一個可監控函數
  mock掉就不用開db
  測試單個檔 npx jest 檔名
*/

const jwt = require('jsonwebtoken');
const {authMiddleware} = require('../middleware/authMiddleware');
const User = require('../models/userModel');


beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret123';
});

describe('authMiddleware', () => {
  let req, res, next;

  const buildRes = () => {
    const res = {};
    //mockReturnValue => 模擬回傳值
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  }

  beforeEach(() => {
    req = { headers: {}};
    res = buildRes();
    next = jest.fn();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should return 401 : without Token', async () => {
    await authMiddleware(req, res, next);

    //toHaveBeenCalledWith是專門處理mockReturnValue用
    //普通用toBe
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      //指定的key存在(此為message存在就過)
      expect.objectContaining({message: expect.stringMatching(/未授權|Token/)})
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401: Token format error', async () => {
    req.headers.authorization = 'InvalidFormat';

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({message: expect.stringMatching(/格式錯誤/)})
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401: token invalid', async () => {
    req.headers.authorization = 'Bearer badtoken';
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({message: expect.stringMatching(/Token/)})
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401: user is not existed', async () => {
    req.headers.authorization = 'Bearer goodtoken';
    //讓他回傳user_id:123
    jest.spyOn(jwt, 'verify').mockReturnValue({user_id: 123});
    //讓他回傳null
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);

    await authMiddleware(req, res, next);
    //用剛得到的123去測試middleware有沒有查 =>上面設定回傳null
    expect(User.findByPk).toHaveBeenCalledWith(123, {
      attributes: {exclude: ['password']},
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({message: expect.stringMatching(/不存在|無效/)})
    );
    expect(next).not.toHaveBeenCalled();
  });
 
  it('Valid token and user exist', async () => {
    req.headers.authorization = 'Bearer goodtoken';
    const fakeUser = {user_id: 123, username: 'Test', role: 'user'};

    jest.spyOn(jwt, 'verify').mockReturnValue({user_id:123});

    jest.spyOn(User, 'findByPk').mockResolvedValue(fakeUser);

    await authMiddleware(req, res, next);

    expect(User.findByPk).toHaveBeenCalledWith(123, {
      attributes: {exclude: ['password']},
    });

    //物件或陣列需要比對內容用toEqual 
    expect(req.user).toEqual(fakeUser);

    expect(next).toHaveBeenCalledTimes(1);
  });
})

