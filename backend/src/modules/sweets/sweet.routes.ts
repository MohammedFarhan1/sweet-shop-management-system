import { Router } from 'express';
import { SweetController } from './sweet.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/role.middleware';

const router = Router();
const sweetController = new SweetController();

// All routes require authentication
router.use(authenticateToken);

// Public routes (for authenticated users)
router.get('/', sweetController.getAllSweets);
router.get('/search', sweetController.searchSweets);

// Admin-only routes
router.post('/', requireAdmin, sweetController.createSweet);
router.put('/:id', requireAdmin, sweetController.updateSweet);
router.delete('/:id', requireAdmin, sweetController.deleteSweet);

export { router as sweetRoutes };