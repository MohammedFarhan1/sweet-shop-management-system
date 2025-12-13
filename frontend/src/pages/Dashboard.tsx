import React, { useState, useEffect } from 'react';
import { sweetsAPI, Sweet } from '../api/api';

const Dashboard: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.name = searchTerm;
      if (category) params.category = category;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);

      const response = await sweetsAPI.search(params);
      setSweets(response.data.sweets);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (sweetId: string, quantity: number) => {
    try {
      await sweetsAPI.purchase(sweetId, quantity);
      fetchSweets(); // Refresh the list
      alert('Purchase successful!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Purchase failed');
    }
  };

  const categories = [...new Set(sweets.map(sweet => sweet.category))];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sweet Shop Dashboard</h1>

      {/* Search Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Search Sweets</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategory('');
              setMinPrice('');
              setMaxPrice('');
              fetchSweets();
            }}
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sweets.map((sweet) => (
            <div key={sweet.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{sweet.name}</h3>
              <p className="text-gray-600 mb-2">Category: {sweet.category}</p>
              <p className="text-lg font-bold text-green-600 mb-2">${sweet.price}</p>
              <p className="text-sm text-gray-500 mb-4">
                Stock: {sweet.quantity} {sweet.quantity === 0 ? '(Out of Stock)' : ''}
              </p>
              
              {sweet.quantity > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={sweet.quantity}
                    defaultValue="1"
                    className="w-20 px-2 py-1 border rounded"
                    id={`quantity-${sweet.id}`}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`quantity-${sweet.id}`) as HTMLInputElement;
                      const quantity = parseInt(input.value);
                      if (quantity > 0 && quantity <= sweet.quantity) {
                        handlePurchase(sweet.id, quantity);
                      } else {
                        alert('Invalid quantity');
                      }
                    }}
                    className="bg-green-500 hover:bg-green-700 text-white px-4 py-1 rounded"
                  >
                    Purchase
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {sweets.length === 0 && !loading && (
        <div className="text-center text-gray-500">No sweets found</div>
      )}
    </div>
  );
};

export default Dashboard;