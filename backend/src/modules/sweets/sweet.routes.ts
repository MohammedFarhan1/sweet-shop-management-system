import { Router } from 'express';
import { SweetController } from './sweet.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/role.middleware';
import { InventoryService } from '../inventory/inventory.service';
import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { Order } from '../orders/order.model';
import { Sweet } from './sweet.model';

const router = Router();
const sweetController = new SweetController();
const inventoryService = new InventoryService();

// All routes require authentication
router.use(authenticateToken);

// Public routes (for authenticated users)
router.get('/', sweetController.getAllSweets);
router.get('/search', sweetController.searchSweets);

// Inventory routes (authenticated users can purchase)
router.post('/:id/purchase', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    // Get sweet details for order creation
    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }
    
    const result = await inventoryService.purchaseSweet(id, req.body);
    
    // Create order record
    const order = new Order({
      userId: req.user?.userId,
      sweetId: id,
      sweetName: sweet.name,
      quantity: quantity,
      quantityType: sweet.quantityType || 'nos',
      unitPrice: sweet.price,
      totalPrice: sweet.price * quantity,
      status: 'Placed'
    });
    await order.save();
    
    res.status(200).json(result);
  } catch (error) {
    if ((error as Error).message === 'Sweet not found') {
      res.status(404).json({ error: (error as Error).message });
    } else {
      res.status(400).json({ error: (error as Error).message });
    }
  }
});

// Admin-only routes
router.post('/', requireAdmin, sweetController.createSweet);
router.put('/:id', requireAdmin, sweetController.updateSweet);
router.delete('/:id', requireAdmin, sweetController.deleteSweet);

// Admin-only inventory routes
router.post('/:id/restock', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await inventoryService.restockSweet(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    if ((error as Error).message === 'Sweet not found') {
      res.status(404).json({ error: (error as Error).message });
    } else {
      res.status(400).json({ error: (error as Error).message });
    }
  }
});

export { router as sweetRoutes };