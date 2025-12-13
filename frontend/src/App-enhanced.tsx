import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [newSweet, setNewSweet] = useState({ name: '', category: '', price: '', quantity: '', quantityType: 'nos' });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [purchaseQuantities, setPurchaseQuantities] = useState({});
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadSweets(savedToken);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const url = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          loadSweets(data.token);
        } else {
          // After successful registration, auto-login
          const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const loginData = await loginResponse.json();
          if (loginResponse.ok) {
            setUser(loginData.user);
            setToken(loginData.token);
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('user', JSON.stringify(loginData.user));
            loadSweets(loginData.token);
          }
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const loadSweets = async (authToken) => {
    try {
      const response = await fetch('http://localhost:5000/api/sweets', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSweets(data.sweets);
        setFilteredSweets(data.sweets);
      }
    } catch (error) {
      console.error('Failed to load sweets');
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders');
    }
  };

  const loadAllOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAllOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to load all orders');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setMessage('Order status updated successfully!');
        loadAllOrders();
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Failed to update order status');
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics');
    }
  };

  const filterSweets = () => {
    let filtered = sweets.filter(sweet => {
      const matchesName = sweet.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || sweet.category.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchesMinPrice = !minPrice || sweet.price >= parseFloat(minPrice);
      const matchesMaxPrice = !maxPrice || sweet.price <= parseFloat(maxPrice);
      return matchesName && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
    setFilteredSweets(filtered);
  };

  useEffect(() => {
    filterSweets();
  }, [searchTerm, categoryFilter, minPrice, maxPrice, sweets]);

  const createSweet = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/sweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newSweet.name,
          category: newSweet.category,
          price: parseFloat(newSweet.price),
          quantity: parseInt(newSweet.quantity),
          quantityType: newSweet.quantityType
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Sweet created successfully!');
        setNewSweet({ name: '', category: '', price: '', quantity: '', quantityType: 'nos' });
        setShowCreateForm(false);
        loadSweets(token);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Failed to create sweet');
    }
  };

  const purchaseSweet = async (sweetId, quantity) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sweets/${sweetId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      const data = await response.json();
      if (response.ok) {
        const sweet = sweets.find(s => s._id === sweetId);
        const quantityType = sweet?.quantityType || 'nos';
        setMessage(`Purchase successful! Bought ${quantity} ${quantityType}`);
        loadSweets(token);
        setPurchaseQuantities({...purchaseQuantities, [sweetId]: 1});
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Purchase failed');
    }
  };

  const updateSweet = async (sweetId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sweets/${sweetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        setMessage('Sweet updated successfully!');
        setEditingSweet(null);
        loadSweets(token);
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Update failed');
    }
  };

  const deleteSweet = async (sweetId) => {
    if (window.confirm('Are you sure you want to delete this sweet?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/sweets/${sweetId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setMessage('Sweet deleted successfully!');
          loadSweets(token);
        } else {
          const data = await response.json();
          setMessage(`Error: ${data.error}`);
        }
      } catch (error) {
        setMessage('Delete failed');
      }
    }
  };

  const restockSweet = async (sweetId, quantity) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sweets/${sweetId}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      if (response.ok) {
        setMessage('Restock successful!');
        loadSweets(token);
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Restock failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setSweets([]);
    setFilteredSweets([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const categories = [...new Set(sweets.map(sweet => sweet.category))];

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>🍭 Sweet Shop</h1>
            <p style={{ color: '#666', fontSize: '16px' }}>Welcome to our delicious world!</p>
          </div>
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '4px' }}>
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: isLogin ? '#667eea' : 'transparent',
                  color: isLogin ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🔑 Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: !isLogin ? '#667eea' : 'transparent',
                  color: !isLogin ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📝 Register
              </button>
            </div>
          </div>
          
          <form onSubmit={handleAuth}>
            {error && <div style={{ color: '#dc3545', marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '6px', fontSize: '14px' }}>{error}</div>}
            
            {!isLogin && (
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="👤 Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.3s' }}
                  required
                />
              </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                placeholder="📧 Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.3s' }}
                required
              />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <input
                type="password"
                placeholder="🔒 Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.3s' }}
                required
                minLength="6"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '14px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.3s' }}
            >
              {loading ? '🔄 Processing...' : (isLogin ? '🚀 Sign In' : '✨ Create Account')}
            </button>
          </form>
          <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '14px', color: '#666' }}>
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>🧪 Test Accounts:</p>
            <p>👨‍💼 Admin: admin@example.com / admin123</p>
            <p>👤 User: user@example.com / user123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>🍭 Sweet Shop</h1>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>Welcome, {user.name} ({user.role})</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => setCurrentPage('dashboard')} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: currentPage === 'dashboard' ? '#007bff' : '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: '600' 
              }}
            >
              🏠 Dashboard
            </button>
            {user.role === 'USER' && (
              <button 
                onClick={() => { setCurrentPage('orders'); loadOrders(); }} 
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: currentPage === 'orders' ? '#007bff' : '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontWeight: '600' 
                }}
              >
                📋 My Orders
              </button>
            )}
            {user.role === 'ADMIN' && (
              <>
                <button 
                  onClick={() => setCurrentPage('admin')} 
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: currentPage === 'admin' ? '#007bff' : '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontWeight: '600' 
                  }}
                >
                  ⚙️ Admin
                </button>
                <button 
                  onClick={() => { setCurrentPage('admin-orders'); loadAllOrders(); }} 
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: currentPage === 'admin-orders' ? '#007bff' : '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontWeight: '600' 
                  }}
                >
                  📋 Orders
                </button>
                <button 
                  onClick={() => { setCurrentPage('analytics'); loadAnalytics(); }} 
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: currentPage === 'analytics' ? '#007bff' : '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontWeight: '600' 
                  }}
                >
                  📈 Reports
                </button>
              </>
            )}
            <button onClick={logout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div style={{ 
            padding: '15px', 
            marginBottom: '20px', 
            backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda', 
            border: `1px solid ${message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`, 
            borderRadius: '8px', 
            color: message.includes('Error') ? '#721c24' : '#155724',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

        {/* Analytics/Reports Dashboard */}
        {currentPage === 'analytics' && user.role === 'ADMIN' && analytics && (
          <div>
            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' }}>
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>💰</div>
                <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '5px' }}>Today's Sales</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>₹{analytics.dailySales.toFixed(2)}</p>
                <p style={{ fontSize: '14px', color: '#666' }}>{analytics.dailyOrderCount} orders</p>
              </div>
              
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📈</div>
                <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '5px' }}>Total Revenue</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>₹{analytics.totalRevenue.toFixed(2)}</p>
                <p style={{ fontSize: '14px', color: '#666' }}>{analytics.totalOrderCount} total orders</p>
              </div>
              
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
                <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '5px' }}>Low Stock Alert</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{sweets.filter(s => s.quantity <= 5).length}</p>
                <p style={{ fontSize: '14px', color: '#666' }}>items need restock</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
              {/* Most Sold Sweets */}
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>🎆 Top Selling Sweets</h3>
                {analytics.mostSoldSweets.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No sales data available</p>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {analytics.mostSoldSweets.map((sweet, index) => (
                      <div key={sweet.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            backgroundColor: ['#ffd700', '#c0c0c0', '#cd7f32', '#e6e6fa', '#f0e68c'][index] || '#ddd',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '12px', 
                            fontWeight: 'bold' 
                          }}>
                            {index + 1}
                          </span>
                          <span style={{ fontWeight: 'bold' }}>{sweet.name}</span>
                        </div>
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>{sweet.quantity} sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Low Stock Items */}
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>⚠️ Low Stock Alerts</h3>
                {sweets.filter(s => s.quantity <= 5).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                    <p style={{ color: '#28a745', fontWeight: 'bold' }}>All items well stocked!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {sweets.filter(s => s.quantity <= 5).map((sweet) => (
                      <div key={sweet._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: sweet.quantity === 0 ? '#f8d7da' : '#fff3cd', borderRadius: '8px', border: `1px solid ${sweet.quantity === 0 ? '#f5c6cb' : '#ffeaa7'}` }}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>{sweet.name}</span>
                          <div style={{ fontSize: '12px', color: '#666' }}>{sweet.category}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            color: sweet.quantity === 0 ? '#721c24' : '#856404', 
                            fontWeight: 'bold' 
                          }}>
                            {sweet.quantity} {sweet.quantityType || 'nos'}
                          </span>
                          <div style={{ fontSize: '12px', color: sweet.quantity === 0 ? '#721c24' : '#856404' }}>
                            {sweet.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Orders Management */}
        {currentPage === 'admin-orders' && user.role === 'ADMIN' && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>📋 Orders Management ({allOrders.length})</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ padding: '10px 15px', backgroundColor: '#e8f5e8', borderRadius: '8px', fontSize: '14px' }}>
                  <strong>Total Sales: ₹{allOrders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}</strong>
                </div>
                <div style={{ padding: '10px 15px', backgroundColor: '#fff3cd', borderRadius: '8px', fontSize: '14px' }}>
                  <strong>Today: {allOrders.filter(order => new Date(order.createdAt).toDateString() === new Date().toDateString()).length} orders</strong>
                </div>
              </div>
            </div>
            
            {allOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
                <h3 style={{ fontSize: '20px', color: '#666', marginBottom: '10px' }}>No orders yet</h3>
                <p style={{ color: '#999' }}>Orders will appear here when customers make purchases</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Order ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Customer</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Sweet</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Quantity</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((order) => (
                      <tr key={order._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>#{order._id.slice(-8)}</td>
                        <td style={{ padding: '12px' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{order.customerName}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{order.customerEmail}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{order.sweetName}</td>
                        <td style={{ padding: '12px' }}>{order.quantity} {order.quantityType}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#28a745' }}>₹{order.totalPrice}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            backgroundColor: order.status === 'Completed' ? '#d4edda' : order.status === 'Preparing' ? '#fff3cd' : '#cce5ff',
                            color: order.status === 'Completed' ? '#155724' : order.status === 'Preparing' ? '#856404' : '#004085'
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select 
                            value={order.status} 
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
                          >
                            <option value="Placed">Placed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* My Orders Page */}
        {currentPage === 'orders' && user.role === 'USER' && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>📋 My Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
                <h3 style={{ fontSize: '20px', color: '#666', marginBottom: '10px' }}>No orders yet</h3>
                <p style={{ color: '#999' }}>Start shopping to see your orders here!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {orders.map((order) => (
                  <div key={order._id} style={{ border: '1px solid #e1e5e9', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>ORDER ID</p>
                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>#{order._id.slice(-8)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>SWEET</p>
                        <p style={{ fontWeight: 'bold' }}>{order.sweetName}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>QUANTITY</p>
                        <p style={{ fontWeight: 'bold' }}>{order.quantity} {order.quantityType}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>TOTAL PRICE</p>
                        <p style={{ fontWeight: 'bold', color: '#28a745' }}>₹{order.totalPrice}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>DATE & TIME</p>
                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>STATUS</p>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          backgroundColor: order.status === 'Completed' ? '#d4edda' : order.status === 'Preparing' ? '#fff3cd' : '#cce5ff',
                          color: order.status === 'Completed' ? '#155724' : order.status === 'Preparing' ? '#856404' : '#004085'
                        }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search & Filter */}
        {currentPage === 'dashboard' && (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>🔍 Search & Filter</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <input
              type="text"
              placeholder="🔍 Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '14px' }}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">🏷️ All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input
              type="number"
              placeholder="💰 Min Price (₹)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '14px' }}
            />
            <input
              type="number"
              placeholder="💰 Max Price (₹)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
        </div>
        )}

        {/* Admin Panel */}
        {(currentPage === 'admin' || currentPage === 'dashboard') && user.role === 'ADMIN' && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0 }}>📦 Admin Panel</h2>
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)} 
                style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                {showCreateForm ? '❌ Cancel' : '➕ Add New Sweet'}
              </button>
            </div>
            
            {showCreateForm && (
              <form onSubmit={createSweet} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <input type="text" placeholder="🍬 Sweet Name" value={newSweet.name} onChange={(e) => setNewSweet({...newSweet, name: e.target.value})} style={{ padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }} required />
                <input type="text" placeholder="🏷️ Category" value={newSweet.category} onChange={(e) => setNewSweet({...newSweet, category: e.target.value})} style={{ padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }} required />
                <input type="number" step="0.01" placeholder="💰 Price (₹)" value={newSweet.price} onChange={(e) => setNewSweet({...newSweet, price: e.target.value})} style={{ padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }} required />
                <input type="number" placeholder="📦 Quantity" value={newSweet.quantity} onChange={(e) => setNewSweet({...newSweet, quantity: e.target.value})} style={{ padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }} required />
                <select value={newSweet.quantityType} onChange={(e) => setNewSweet({...newSweet, quantityType: e.target.value})} style={{ padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px' }} required>
                  <option value="nos">📊 nos (Numbers)</option>
                  <option value="kg">⚖️ kg (Kilograms)</option>
                  <option value="grams">📏 grams</option>
                  <option value="liters">🥤 liters</option>
                  <option value="pieces">🧩 pieces</option>
                </select>
                <button type="submit" style={{ padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>✨ Create Sweet</button>
              </form>
            )}
          </div>
        )}

        {/* Sweets Grid */}
        {currentPage === 'dashboard' && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
            {user.role === 'ADMIN' ? '📋 Manage Sweets' : '🛒 Available Sweets'} ({filteredSweets.length})
          </h2>
          
          {filteredSweets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🍭</div>
              <h3 style={{ fontSize: '20px', color: '#666', marginBottom: '10px' }}>No sweets found</h3>
              <p style={{ color: '#999' }}>{user.role === 'ADMIN' ? 'Create some delicious sweets above!' : 'Ask admin to add some sweets.'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredSweets.map((sweet) => (
                <div key={sweet._id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}>
                  <div style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0 }}>{sweet.name}</h3>
                      <span style={{ 
                        padding: '4px 12px', 
                        backgroundColor: sweet.quantity > 0 ? '#d4edda' : '#f8d7da', 
                        color: sweet.quantity > 0 ? '#155724' : '#721c24', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600' 
                      }}>
                        {sweet.quantity > 0 ? '✅ In Stock' : '❌ Out of Stock'}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: '#666', marginBottom: '5px' }}>🏷️ Category: <strong>{sweet.category}</strong></p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>₹{sweet.price}</p>
                      <p style={{ color: '#666' }}>📦 Stock: <strong>{sweet.quantity} {sweet.quantityType || 'nos'}</strong></p>
                    </div>

                    {user.role === 'ADMIN' ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => deleteSweet(sweet._id)} 
                          style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          🗑️ Delete
                        </button>
                        <input 
                          type="number" 
                          min="1" 
                          defaultValue="10" 
                          style={{ width: '70px', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} 
                          id={`restock-${sweet._id}`} 
                        />
                        <button 
                          onClick={() => { 
                            const qty = parseInt(document.getElementById(`restock-${sweet._id}`).value); 
                            if (qty > 0) restockSweet(sweet._id, qty); 
                          }} 
                          style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          📦 Restock
                        </button>
                      </div>
                    ) : (
                      sweet.quantity > 0 && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max={sweet.quantity}
                            value={purchaseQuantities[sweet._id] || 1}
                            onChange={(e) => setPurchaseQuantities({...purchaseQuantities, [sweet._id]: parseInt(e.target.value)})}
                            style={{ width: '80px', padding: '8px', border: '2px solid #e1e5e9', borderRadius: '6px', fontSize: '14px' }}
                          />
                          <button 
                            onClick={() => {
                              const qty = purchaseQuantities[sweet._id] || 1;
                              if (qty <= sweet.quantity) purchaseSweet(sweet._id, qty);
                            }}
                            style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            🛒 Buy for ₹{((purchaseQuantities[sweet._id] || 1) * sweet.price).toFixed(2)}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export default App;