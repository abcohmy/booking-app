
const { initializeDb, sequelize} = require('../db/index');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

const setupTestDb = async () => {
  await initializeDb();
  await User.destroy({ where: {} });
  //bulkCreate 會跳過hook內的beforeCreate不要用，雖可加{ individualHooks: true }解決
  //但登入不建議用
  await User.create({
    username: 'testuser',
    password: 'testpass123',
    role: 'user'
  });
  await User.create({
    username: 'testadmin',
    password: 'testpass123',
    role: 'admin'
  }); 
    
  await Booking.destroy( {where: {}});
  await Booking.create({
    name: 'testuser',
    phone: '0987654321',
    booking_time: new Date() ,
    status: 'pending',
  });
};

module.exports = { setupTestDb, sequelize };