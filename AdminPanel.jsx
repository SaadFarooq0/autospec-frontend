
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Admin Panel: Manage Car Specs</h1>
      <Input
        placeholder="Model name (e.g., Toyota Camry XLE)"
        value={model}
        onChange={(e) => setModel(e.target.value)}
      />
      <Textarea
        rows={10}
        placeholder="Specs as JSON"
        value={specs}
        onChange={(e) => setSpecs(e.target.value)}
      />
      <div className="flex space-x-4">
        <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Car</Button>
        <input type="file" id="pdfupload" accept="application/pdf" className="hidden" />
        <Button variant="outline" onClick={() => document.getElementById('pdfupload').click()}>
          Upload PDF
        </Button>
        <Button onClick={handleAutoExtract}>Auto Extract Specs</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        {cars.map((car) => (
          <Card key={car.id}>
            <CardContent className="p-4 space-y-2">
              <h2 className="font-semibold text-lg">{car.model}</h2>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(car.specs, null, 2)}
              </pre>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEdit(car)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(car.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
