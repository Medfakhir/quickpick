import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
