import { Router } from 'express';
import { Order } from './order.model';
import { authenticateToken, AuthRequest } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/role.middleware';
import { User } from '../auth/user.model';
import { Response } from 'express';

const router = Router();

router.use(authenticateToken);

// Get user's orders
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Get all orders with customer details
router.get('/admin/all', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    const ordersWithCustomers = await Promise.all(
      orders.map(async (order) => {
        const customer = await User.findById(order.userId);
        return {
          ...order.toObject(),
          customerName: customer?.name || 'Unknown',
          customerEmail: customer?.email || 'Unknown'
        };
      })
    );
    res.json({ orders: ordersWithCustomers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Update order status
router.put('/admin/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ order, message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Admin: Get analytics data
router.get('/admin/analytics', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Daily sales
    const dailyOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    const dailySales = dailyOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Total revenue
    const allOrders = await Order.find({});
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Most sold sweets
    const sweetSales: { [key: string]: number } = {};
    allOrders.forEach(order => {
      if (sweetSales[order.sweetName]) {
        sweetSales[order.sweetName] += order.quantity;
      } else {
        sweetSales[order.sweetName] = order.quantity;
      }
    });
    const mostSold = Object.entries(sweetSales)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity: quantity as number }));
    
    res.json({
      dailySales,
      dailyOrderCount: dailyOrders.length,
      totalRevenue,
      totalOrderCount: allOrders.length,
      mostSoldSweets: mostSold
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export { router as orderRoutes };