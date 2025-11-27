import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const deliveryBoySchema = new mongoose.Schema({

  first_name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
    required: true,
  },

  mobile: {
    type: String,
    required: true,
    unique: true,
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
    required: true,
    minlength: 6
  },

  vehicle_type: {
    type: String,
    default: '' 
  },

  vehicle_number: {
    type: String,
    default: ''
  },

  current_location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },

  isActive: {
    type: Boolean,
    default: false 
  },

  resetPasswordToken: {
    type: String,
    default: null
  },

  resetPasswordExpires: {
    type: Date,
    default: null
  }

}, { timestamps: true });

deliveryBoySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

deliveryBoySchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

deliveryBoySchema.methods.updatePassword = async function (currentPassword, newPassword) {
  const isMatch = await this.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  this.password = newPassword;
  await this.save();
  return true;
};

const DeliveryBoy = mongoose.model('DeliveryBoy', deliveryBoySchema);
export default DeliveryBoy;
