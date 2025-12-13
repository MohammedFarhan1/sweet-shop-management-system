import { Sweet, ISweet } from './sweet.model';

export interface CreateSweetData {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateSweetData {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface SearchQuery {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class SweetService {
  async createSweet(sweetData: CreateSweetData): Promise<{ sweet: Partial<ISweet>; message: string }> {
    const { name, category, price, quantity } = sweetData;

    // Validate input
    if (!name || !category || price === undefined || quantity === undefined) {
      throw new Error('All fields are required');
    }

    if (price < 0) {
      throw new Error('Price must be greater than or equal to 0');
    }

    if (quantity < 0) {
      throw new Error('Quantity must be greater than or equal to 0');
    }

    if (name.trim() === '' || category.trim() === '') {
      throw new Error('Name and category cannot be empty');
    }

    // Create sweet
    const sweet = new Sweet({
      name: name.trim(),
      category: category.trim(),
      price,
      quantity
    });

    await sweet.save();

    // Return sweet response
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
      message: 'Sweet created successfully'
    };
  }

  async getAllSweets(): Promise<{ sweets: Partial<ISweet>[] }> {
    const sweets = await Sweet.find().sort({ createdAt: -1 });

    const sweetsResponse = sweets.map(sweet => ({
      id: sweet._id,
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
      createdAt: sweet.createdAt,
      updatedAt: sweet.updatedAt
    }));

    return { sweets: sweetsResponse };
  }

  async searchSweets(query: SearchQuery): Promise<{ sweets: Partial<ISweet>[] }> {
    const filter: any = {};

    if (query.name) {
      filter.name = { $regex: query.name, $options: 'i' };
    }

    if (query.category) {
      filter.category = { $regex: query.category, $options: 'i' };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) {
        filter.price.$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        filter.price.$lte = query.maxPrice;
      }
    }

    const sweets = await Sweet.find(filter).sort({ createdAt: -1 });

    const sweetsResponse = sweets.map(sweet => ({
      id: sweet._id,
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
      createdAt: sweet.createdAt,
      updatedAt: sweet.updatedAt
    }));

    return { sweets: sweetsResponse };
  }

  async updateSweet(id: string, updateData: UpdateSweetData): Promise<{ sweet: Partial<ISweet>; message: string }> {
    // Validate input
    if (updateData.price !== undefined && updateData.price < 0) {
      throw new Error('Price must be greater than or equal to 0');
    }

    if (updateData.quantity !== undefined && updateData.quantity < 0) {
      throw new Error('Quantity must be greater than or equal to 0');
    }

    if (updateData.name !== undefined && updateData.name.trim() === '') {
      throw new Error('Name cannot be empty');
    }

    if (updateData.category !== undefined && updateData.category.trim() === '') {
      throw new Error('Category cannot be empty');
    }

    // Find and update sweet
    const sweet = await Sweet.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!sweet) {
      throw new Error('Sweet not found');
    }

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
      message: 'Sweet updated successfully'
    };
  }

  async deleteSweet(id: string): Promise<{ message: string }> {
    const sweet = await Sweet.findByIdAndDelete(id);

    if (!sweet) {
      throw new Error('Sweet not found');
    }

    return { message: 'Sweet deleted successfully' };
  }
}