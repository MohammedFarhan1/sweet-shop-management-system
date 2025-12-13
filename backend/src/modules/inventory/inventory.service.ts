import { Sweet, ISweet } from '../sweets/sweet.model';

export interface PurchaseData {
  quantity: number;
}

export interface RestockData {
  quantity: number;
}

export class InventoryService {
  async purchaseSweet(sweetId: string, purchaseData: PurchaseData): Promise<{ sweet: Partial<ISweet>; message: string }> {
    const { quantity } = purchaseData;

    // Validate input
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Find the sweet
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      throw new Error('Sweet not found');
    }

    // Check if sweet is in stock
    if (sweet.quantity === 0) {
      throw new Error('Sweet is out of stock');
    }

    // Check if sufficient quantity is available
    if (sweet.quantity < quantity) {
      throw new Error('Insufficient quantity available');
    }

    // Update quantity
    sweet.quantity -= quantity;
    sweet.updatedAt = new Date();
    await sweet.save();

    // Return updated sweet
    const sweetResponse = {
      id: sweet._id,
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
      createdAt: sweet.createdAt,
      updatedAt: sweet.updatedAt
    };

    return {
      sweet: sweetResponse,
      message: 'Purchase successful'
    };
  }

  async restockSweet(sweetId: string, restockData: RestockData): Promise<{ sweet: Partial<ISweet>; message: string }> {
    const { quantity } = restockData;

    // Validate input
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Find the sweet
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      throw new Error('Sweet not found');
    }

    // Update quantity
    sweet.quantity += quantity;
    sweet.updatedAt = new Date();
    await sweet.save();

    // Return updated sweet
    const sweetResponse = {
      id: sweet._id,
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
      createdAt: sweet.createdAt,
      updatedAt: sweet.updatedAt
    };

    return {
      sweet: sweetResponse,
      message: 'Restock successful'
    };
  }
}