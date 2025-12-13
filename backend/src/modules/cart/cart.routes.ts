import { Router } from 'express';
import { CartController } from './cart.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
const cartController = new CartController();

// All cart routes require authentication
router.use(authenticateToken);

// Cart routes
router.post('/add', cartController.addToCart);
router.get('/', cartController.getCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export { router as cartRoutes };