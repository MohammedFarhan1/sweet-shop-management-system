import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadSweets(savedToken);
      loadCartCount();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        loadSweets(data.token);
        loadCartCount();
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

  const addToCart = async (sweetId, quantity = 1) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sweetId, quantity })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`Added to cart successfully!`);
        loadCartCount();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Failed to add to cart');
    }
  };

  const loadCartCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCartCount(data.cartItems.length);
      }
    } catch (error) {
      console.error('Failed to load cart count');
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
        setMessage(`Purchase successful! Bought ${quantity} item(s)`);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Sweet Shop Login</h2>
        <form onSubmit={handleLogin}>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <div style={{ marginBottom: '15px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          <p><strong>Test accounts:</strong></p>
          <p>Admin: admin@example.com / admin123</p>
          <p>User: user@example.com / user123</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Sweet Shop - Welcome {user.name} ({user.role})</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user.role === 'USER' && (
            <div style={{ position: 'relative' }}>
              <button 
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => setMessage('Cart feature - View cart functionality can be added here')}
              >
                🛒 Cart
              </button>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {cartCount}
                </span>
              )}
            </div>
          )}
          <button onClick={logout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
            Logout
          </button>
        </div>
      </div>

      {message && <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda', border: '1px solid ' + (message.includes('Error') ? '#f5c6cb' : '#c3e6cb'), borderRadius: '4px', color: message.includes('Error') ? '#721c24' : '#155724' }}>{message}</div>}

      {user.role === 'ADMIN' && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>Admin Panel</h2>
            <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
              {showCreateForm ? 'Cancel' : 'Add New Sweet'}
            </button>
          </div>
          
          {showCreateForm && (
            <form onSubmit={createSweet} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <input type="text" placeholder="Sweet Name" value={newSweet.name} onChange={(e) => setNewSweet({...newSweet, name: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
              <input type="text" placeholder="Category" value={newSweet.category} onChange={(e) => setNewSweet({...newSweet, category: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
              <input type="number" step="0.01" placeholder="Price" value={newSweet.price} onChange={(e) => setNewSweet({...newSweet, price: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="number" placeholder="Quantity" value={newSweet.quantity} onChange={(e) => setNewSweet({...newSweet, quantity: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }} required />
                <select value={newSweet.quantityType} onChange={(e) => setNewSweet({...newSweet, quantityType: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="nos">nos</option>
                  <option value="kg">kg</option>
                  <option value="grams">grams</option>
                  <option value="liters">liters</option>
                  <option value="pieces">pieces</option>
                </select>
              </div>
              <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Create Sweet</button>
            </form>
          )}
        </div>
      )}

      <h2>{user.role === 'ADMIN' ? 'Manage Sweets' : 'Available Sweets'}</h2>
      {sweets.length === 0 ? (
        <p>No sweets available. {user.role === 'ADMIN' ? 'Create some sweets above!' : 'Ask admin to add sweets.'}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {sweets.map((sweet) => (
            <div key={sweet._id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>{sweet.name}</h3>
              <p style={{ marginBottom: '5px', color: '#666' }}>Category: {sweet.category}</p>
              <p style={{ marginBottom: '5px', fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>${sweet.price}</p>
              <p style={{ marginBottom: '15px', color: sweet.quantity === 0 ? '#dc3545' : '#666' }}>Stock: {sweet.quantity} {sweet.quantityType || 'nos'} {sweet.quantity === 0 ? '(Out of Stock)' : ''}</p>
              
              {user.role === 'ADMIN' ? (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <button onClick={() => deleteSweet(sweet._id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}>Delete</button>
                  <input type="number" min="1" defaultValue="10" style={{ width: '60px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} id={`restock-${sweet._id}`} />
                  <button onClick={() => { const qty = parseInt(document.getElementById(`restock-${sweet._id}`).value); if (qty > 0) restockSweet(sweet._id, qty); }} style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}>Restock</button>
                </div>
              ) : (
                sweet.quantity > 0 && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => addToCart(sweet._id, 1)} 
                      style={{ 
                        flex: 1,
                        padding: '8px 12px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      🛒 Add to Cart
                    </button>
                    <button 
                      onClick={() => purchaseSweet(sweet._id, 1)} 
                      style={{ 
                        flex: 1,
                        padding: '8px 12px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      💳 Buy Now
                    </button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;