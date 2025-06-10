
import { useState, useEffect } from 'react';

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
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h1>Admin Panel</h1>
      <input
        placeholder='Model'
        value={model}
        onChange={(e) => setModel(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />
      <textarea
        placeholder='Specs (JSON format)'
        value={specs}
        rows={10}
        onChange={(e) => setSpecs(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />
      <div>
        <input type='file' id='pdfupload' accept='application/pdf' />
        <button onClick={handleAutoExtract}>Auto Extract Specs</button>
      </div>
      <button onClick={handleSubmit}>
        {editingId ? 'Update' : 'Add'} Car
      </button>
      <div style={{ marginTop: 20 }}>
        {cars.map(car => (
          <div key={car.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            <h3>{car.model}</h3>
            <pre>{JSON.stringify(car.specs, null, 2)}</pre>
            <button onClick={() => handleEdit(car)}>Edit</button>
            <button onClick={() => handleDelete(car.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
