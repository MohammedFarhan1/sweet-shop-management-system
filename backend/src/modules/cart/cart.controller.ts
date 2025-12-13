import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { CartService } from './cart.service';

export class CartController {
  private cartService = new CartService();

  addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const result = await this.cartService.addToCart(userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const result = await this.cartService.getCart(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const { quantity } = req.body;
      
      const result = await this.cartService.updateCartItem(userId, id, quantity);
      res.status(200).json(result);
    } catch (error) {
      if ((error as Error).message === 'Cart item not found') {
        res.status(404).json({ error: (error as Error).message });
      } else {
        res.status(400).json({ error: (error as Error).message });
      }
    }
  };

  removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const result = await this.cartService.removeFromCart(userId, id);
      res.status(200).json(result);
    } catch (error) {
      if ((error as Error).message === 'Cart item not found') {
        res.status(404).json({ error: (error as Error).message });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  };

  clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const result = await this.cartService.clearCart(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}