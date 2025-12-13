import { CartItem, ICartItem } from './cart.model';
import { Sweet } from '../sweets/sweet.model';

export interface AddToCartData {
  sweetId: string;
  quantity: number;
}

export class CartService {
  async addToCart(userId: string, cartData: AddToCartData): Promise<{ message: string; cartItem: any }> {
    const { sweetId, quantity } = cartData;

    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Find the sweet
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      throw new Error('Sweet not found');
    }

    if (sweet.quantity < quantity) {
      throw new Error('Insufficient quantity available');
    }

    // Check if item already exists in cart
    const existingCartItem = await CartItem.findOne({ userId, sweetId });

    if (existingCartItem) {
      // Update quantity
      existingCartItem.quantity += quantity;
      existingCartItem.updatedAt = new Date();
      await existingCartItem.save();

      return {
        message: 'Cart updated successfully',
        cartItem: {
          _id: existingCartItem._id,
          sweetId: existingCartItem.sweetId,
          sweetName: existingCartItem.sweetName,
          price: existingCartItem.price,
          quantity: existingCartItem.quantity,
          quantityType: existingCartItem.quantityType
        }
      };
    } else {
      // Create new cart item
      const cartItem = new CartItem({
        userId,
        sweetId,
        sweetName: sweet.name,
        price: sweet.price,
        quantity,
        quantityType: sweet.quantityType || 'nos'
      });

      await cartItem.save();

      return {
        message: 'Added to cart successfully',
        cartItem: {
          _id: cartItem._id,
          sweetId: cartItem.sweetId,
          sweetName: cartItem.sweetName,
          price: cartItem.price,
          quantity: cartItem.quantity,
          quantityType: cartItem.quantityType
        }
      };
    }
  }

  async getCart(userId: string): Promise<{ cartItems: any[]; total: number }> {
    const cartItems = await CartItem.find({ userId }).sort({ createdAt: -1 });

    const formattedItems = cartItems.map(item => ({
      _id: item._id,
      sweetId: item.sweetId,
      sweetName: item.sweetName,
      price: item.price,
      quantity: item.quantity,
      quantityType: item.quantityType,
      subtotal: item.price * item.quantity
    }));

    const total = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return { cartItems: formattedItems, total };
  }

  async updateCartItem(userId: string, cartItemId: string, quantity: number): Promise<{ message: string; cartItem: any }> {
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const cartItem = await CartItem.findOne({ _id: cartItemId, userId });
    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    cartItem.quantity = quantity;
    cartItem.updatedAt = new Date();
    await cartItem.save();

    return {
      message: 'Cart item updated successfully',
      cartItem: {
        _id: cartItem._id,
        sweetId: cartItem.sweetId,
        sweetName: cartItem.sweetName,
        price: cartItem.price,
        quantity: cartItem.quantity,
        quantityType: cartItem.quantityType
      }
    };
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<{ message: string }> {
    const result = await CartItem.findOneAndDelete({ _id: cartItemId, userId });
    if (!result) {
      throw new Error('Cart item not found');
    }

    return { message: 'Item removed from cart successfully' };
  }

  async clearCart(userId: string): Promise<{ message: string }> {
    await CartItem.deleteMany({ userId });
    return { message: 'Cart cleared successfully' };
  }
}