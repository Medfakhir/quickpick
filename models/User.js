import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: null },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true }, // Store product price here
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
