import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { SweetService } from './sweet.service';

export class SweetController {
  private sweetService = new SweetService();

  createSweet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await this.sweetService.createSweet(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAllSweets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await this.sweetService.getAllSweets();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  searchSweets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const query = {
        name: req.query.name as string,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined
      };

      const result = await this.sweetService.searchSweets(query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateSweet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.sweetService.updateSweet(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      if ((error as Error).message === 'Sweet not found') {
        res.status(404).json({ error: (error as Error).message });
      } else {
        res.status(400).json({ error: (error as Error).message });
      }
    }
  };

  deleteSweet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.sweetService.deleteSweet(id);
      res.status(200).json(result);
    } catch (error) {
      if ((error as Error).message === 'Sweet not found') {
        res.status(404).json({ error: (error as Error).message });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  };
}