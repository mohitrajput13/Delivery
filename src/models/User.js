import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
  },

  last_name: {
    type: String,
  },

  country_code: {      
    type: String,
    required: true,
    trim: true
  },

  mobile: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },

  password: {
    type: String,
    minlength: 6,
    default: null
  },

  profile_image: {
    type: String,   // URL of uploaded image
    default: ''
  },

  address: [{
    addressLine: { type: String },
    lat: { type: Number },
    lng: { type: Number }
  }],

  wallet: {
    type: Number,
    default: 0
  },

  authProvider: {
    type: String,
    default: ''
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,

  otp: {
    type: String,
    default: null
  },

  otpExpires: {
    type: Date,
    default: null
  }

}, { timestamps: true });


// ✅ Fix: Unique constraint on country_code + mobile
userSchema.index({ country_code: 1, mobile: 1 }, { unique: true });


// Hashing Password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare Password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update Password
userSchema.methods.updatePassword = async function (currentPassword, newPassword) {
  const isMatch = await this.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  this.password = newPassword;
  await this.save();
  return true;
};

const User = mongoose.model('User', userSchema);
export default User;
