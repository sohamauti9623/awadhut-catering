import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import api from '../../lib/api';

const emptyPackage = { 
  name: '', 
  category: 'wedding', 
  price: '', 
  guestCount: '', 
  description: '', 
  isFeatured: false, 
  image: '',
  includes: '', 
  extras: '',
  notes: ''
};

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPackage);
  const [uploading, setUploading] = useState(false);

  const fetchPackages = () => {
    setLoading(true);
    api.get('/packages')
      .then(r => { 
        setPackages(r.data); 
        setLoading(false); 
      })
      .catch(() => {
        toast.error("Failed to load packages");
        setLoading(false);
      });
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const sigRes = await api.get('/cloudinary/signature?folder=awadhut-packages');
      const sig = sigRes.data;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', sig.timestamp);
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);
      
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, { 
        method: 'POST', 
        body: formData 
      });
      const data = await uploadRes.json();
      if (data.secure_url) {
        setForm(prev => ({ ...prev, image: data.secure_url }));
        toast.success('Image uploaded!');
      }
    } catch (err) {
      toast.error('Cloudinary upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // CRITICAL FIX: Backend expects numbers and arrays, not strings.
    const payload = {
      ...form,
      price: Number(form.price),
      guestCount: Number(form.guestCount),
      includes: typeof form.includes === 'string' 
        ? form.includes.split(',').map(s => s.trim()).filter(Boolean) 
        : Array.isArray(form.includes) ? form.includes : [],
      extras: typeof form.extras === 'string' 
        ? form.extras.split(',').map(s => s.trim()).filter(Boolean) 
        : Array.isArray(form.extras) ? form.extras : [],
    };

    try {
      if (editing) {
        // Correct PUT method for updates
        await api.put(`/packages/${editing}`, payload);
        toast.success('Package updated');
      } else {
        await api.post('/packages', payload);
        toast.success('Package created');
      }
      setDialogOpen(false);
      fetchPackages();
    } catch (err) {
      console.error("Save error:", err.response?.data);
      toast.error(err.response?.data?.detail || 'Failed to save package');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await api.delete(`/packages/${id}`);
      toast.success('Package deleted');
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete');
    }
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Packages Management</h1>
        <button 
          onClick={() => { 
            setEditing(null); 
            setForm(emptyPackage); 
            setDialogOpen(true); 
          }} 
          className="bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-900 transition-colors"
        >
          <Plus size={18} /> Add Package
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map(pkg => (
              <TableRow key={pkg.id || pkg._id}>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell className="capitalize">{pkg.category}</TableCell>
                <TableCell>₹{Number(pkg.price).toLocaleString()}</TableCell>
                <TableCell>{pkg.isFeatured ? 'Yes' : 'No'}</TableCell>
                <TableCell className="text-right">
                  <button 
                    onClick={() => { 
                      const pkgId = pkg.id || pkg._id;
                      setEditing(pkgId); 
                      setForm({
                        ...pkg,
                        // SAFE JOIN: handles null/undefined arrays when opening edit dialog
                        includes: Array.isArray(pkg.includes) ? pkg.includes.join(', ') : '',
                        extras: Array.isArray(pkg.extras) ? pkg.extras.join(', ') : ''
                      }); 
                      setDialogOpen(true); 
                    }} 
                    className="p-2 hover:bg-stone-100 rounded-lg mr-2"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(pkg.id || pkg._id)} 
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-stone-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-stone-800">
              {editing ? 'Edit Package' : 'Create Package'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-stone-700">Package Name</label>
              <Input placeholder="e.g., Royal Wedding Package" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-stone-700">Category</label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">Price (₹)</label>
                <Input type="number" placeholder="Price" value={form.price} onChange={e => update('price', e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">Guest Count</label>
                <Input type="number" placeholder="Guest Count" value={form.guestCount} onChange={e => update('guestCount', e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-stone-700">Package Image</label>
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-stone-300 text-sm text-stone-600 cursor-pointer hover:bg-stone-50 transition-all mb-2">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload from Computer'}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <Input placeholder="Or paste direct Image URL" value={form.image} onChange={e => update('image', e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-stone-700">Includes (Items separated by commas)</label>
              <Textarea placeholder="6 Sabzi, 2 Dal, Biryani..." value={form.includes} onChange={e => update('includes', e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-stone-700">Extras</label>
              <Textarea placeholder="Live Counters, Special Sweets..." value={form.extras} onChange={e => update('extras', e.target.value)} />
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-sm font-semibold text-stone-700">Show on Homepage?</span>
              <Switch checked={form.isFeatured} onCheckedChange={v => update('isFeatured', v)} />
            </div>

            <button 
              type="submit" 
              disabled={uploading}
              className="w-full bg-red-800 text-white py-3 rounded-xl font-bold hover:bg-red-900 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {editing ? 'Update Package Details' : 'Create New Package'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}