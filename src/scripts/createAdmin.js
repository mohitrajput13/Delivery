import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import config from '../config/config.js';

const createAdmin = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    const adminData = {
      email: 'mohitblackcube@gmail.com',
      password: '123456',
      first_name: 'Admin',
      last_name: 'Admin',
    };

    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      process.exit(0);
    }

    const admin = new Admin(adminData);
    await admin.save();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

export default createAdmin ;