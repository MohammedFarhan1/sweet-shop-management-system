import React, { useState, useEffect } from 'react';
import { sweetsAPI, Sweet } from '../api/api';

const AdminPanel: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: ''
  });

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const response = await sweetsAPI.getAll();
      setSweets(response.data.sweets);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch sweets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      if (editingSweet) {
        await sweetsAPI.update(editingSweet.id, data);
        alert('Sweet updated successfully!');
      } else {
        await sweetsAPI.create(data);
        alert('Sweet created successfully!');
      }

      setFormData({ name: '', category: '', price: '', quantity: '' });
      setShowCreateForm(false);
      setEditingSweet(null);
      fetchSweets();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString()
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sweet?')) {
      try {
        await sweetsAPI.delete(id);
        alert('Sweet deleted successfully!');
        fetchSweets();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  const handleRestock = async (id: string, quantity: number) => {
    try {
      await sweetsAPI.restock(id, quantity);
      alert('Restock successful!');
      fetchSweets();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Restock failed');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingSweet(null);
            setFormData({ name: '', category: '', price: '', quantity: '' });
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Add New Sweet
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingSweet ? 'Edit Sweet' : 'Create New Sweet'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Sweet Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <div className="md:col-span-2 flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                {editingSweet ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingSweet(null);
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sweets.map((sweet) => (
                <tr key={sweet.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{sweet.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sweet.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${sweet.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sweet.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEdit(sweet)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sweet.id)}
                      className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                    <div className="inline-flex items-center space-x-1">
                      <input
                        type="number"
                        min="1"
                        defaultValue="10"
                        className="w-16 px-1 py-1 border rounded text-sm"
                        id={`restock-${sweet.id}`}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`restock-${sweet.id}`) as HTMLInputElement;
                          const quantity = parseInt(input.value);
                          if (quantity > 0) {
                            handleRestock(sweet.id, quantity);
                          }
                        }}
                        className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                      >
                        Restock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sweets.length === 0 && !loading && (
        <div className="text-center text-gray-500">No sweets found</div>
      )}
    </div>
  );
};

export default AdminPanel;