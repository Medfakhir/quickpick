const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true }, // Total price for this product
    },
  ],
  totalAmount: { type: Number, required: true }, // Total for all products
  userDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['Pending', 'Delivered', 'Canceled'],
    default: 'Pending', // Default status
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
