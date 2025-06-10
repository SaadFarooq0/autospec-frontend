
import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://ingenious-friendship-production.up.railway.app';

export default function AdminPanel() {
  const [model, setModel] = useState('');
  const [specs, setSpecs] = useState('');
  const [cars, setCars] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchCars = async () => {
    const res = await fetch(`${API_URL}/cars`);
    const data = await res.json();
    setCars(data);
  };

  const handleSubmit = async () => {
    try {
      const parsedSpecs = JSON.parse(specs);
      const payload = { model, specs: parsedSpecs };
      if (editingId) {
        await fetch(`${API_URL}/cars/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`${API_URL}/cars`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setModel('');
      setSpecs('');
      setEditingId(null);
      fetchCars();
    } catch (err) {
      alert('Invalid JSON specs. Please correct and try again.');
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/cars/${id}`, { method: 'DELETE' });
    fetchCars();
  };

  const handleEdit = (car) => {
    setModel(car.model);
    setSpecs(JSON.stringify(car.specs, null, 2));
    setEditingId(car.id);
  };

  const handleAutoExtract = async () => {
    const file = document.getElementById('pdfupload').files[0];
    if (!file) return alert('Please upload a PDF file.');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/extract-pdf-specs`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    setSpecs(JSON.stringify(data, null, 2));
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return (
    <div className="container">
      <h1>Admin Panel: Manage Car Specs</h1>
      <input
        placeholder="Model name (e.g., Toyota Camry XLE)"
        value={model}
        onChange={(e) => setModel(e.target.value)}
      />
      <textarea
        rows={10}
        placeholder="Specs as JSON"
        value={specs}
        onChange={(e) => setSpecs(e.target.value)}
      />
      <div className="actions">
        <button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Car</button>
        <input type="file" id="pdfupload" accept="application/pdf" />
        <button onClick={handleAutoExtract}>Auto Extract Specs</button>
      </div>
      <div className="car-list">
        {cars.map((car) => (
          <div key={car.id} className="car-card">
            <h2>{car.model}</h2>
            <pre>{JSON.stringify(car.specs, null, 2)}</pre>
            <button onClick={() => handleEdit(car)}>Edit</button>
            <button onClick={() => handleDelete(car.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
