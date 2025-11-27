import mongoose from 'mongoose';

const purchaseNumberSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    phone_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhoneNumber',
      required: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status:String,
    stripeCustomerId:String,
    stripeSubscriptionId:String
  },
  { timestamps: true }
);

const PurchaseNumber = mongoose.model('PurchaseNumber', purchaseNumberSchema);
export default PurchaseNumber;
