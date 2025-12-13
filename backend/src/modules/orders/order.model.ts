import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  sweetId: string;
  sweetName: string;
  quantity: number;
  quantityType: string;
  unitPrice: number;
  totalPrice: number;
  status: 'Placed' | 'Preparing' | 'Completed';
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: true
  },
  sweetId: {
    type: String,
    required: true
  },
  sweetName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  quantityType: {
    type: String,
    required: true,
    default: 'nos'
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Placed', 'Preparing', 'Completed'],
    default: 'Placed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);