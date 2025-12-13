import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem extends Document {
  userId: string;
  sweetId: string;
  sweetName: string;
  price: number;
  quantity: number;
  quantityType: string;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sweetId: {
    type: String,
    required: true
  },
  sweetName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  quantityType: {
    type: String,
    default: 'nos'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const CartItem = mongoose.model<ICartItem>('CartItem', cartItemSchema);