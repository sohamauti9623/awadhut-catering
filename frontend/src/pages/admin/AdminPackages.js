import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import api from '../../lib/api';

const emptyPkg = { name: '', category: 'wedding', price: '', guestCount: '', includes: '', extras: '', notes: '', isFeatured: false, image: '' };

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPkg);

  const fetchPackages = () => {
    api.get('/packages').then(r => { setPackages(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchPackages(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyPkg); setDialogOpen(true); };

  const openEdit = (pkg) => {
    setEditing(pkg.id);
    setForm({
      name: pkg.name, category: pkg.category, price: pkg.price.toString(),
      guestCount: pkg.guestCount.toString(), includes: pkg.includes.join(', '),
      extras: pkg.extras.join(', '), notes: pkg.notes, isFeatured: pkg.isFeatured, image: pkg.image || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name, category: form.category, price: parseFloat(form.price),
      guestCount: parseInt(form.guestCount), includes: form.includes.split(',').map(s => s.trim()).filter(Boolean),
      extras: form.extras.split(',').map(s => s.trim()).filter(Boolean), notes: form.notes,
      isFeatured: form.isFeatured, image: form.image,
    };
    try {
      if (editing) {
        await api.put(`/packages/${editing}`, payload);
        toast.success('Package updated');
      } else {
        await api.post('/packages', payload);
        toast.success('Package created');
      }
      setDialogOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save package');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await api.delete(`/packages/${id}`);
      toast.success('Package deleted');
      fetchPackages();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div data-testid="admin-packages">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Packages</h1>
          <p className="text-sm text-stone-500">Manage your event packages</p>
        </div>
        <button
          data-testid="add-package-btn"
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-900 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-stone-100 animate-pulse" />)}</div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map(pkg => (
                <TableRow key={pkg.id} data-testid={`package-row-${pkg.id}`}>
                  <TableCell className="font-medium text-stone-900">{pkg.name}</TableCell>
                  <TableCell><span className="capitalize text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">{pkg.category}</span></TableCell>
                  <TableCell>Rs {pkg.price.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{pkg.guestCount}</TableCell>
                  <TableCell>{pkg.isFeatured ? <span className="text-xs text-green-600 font-medium">Yes</span> : <span className="text-xs text-stone-400">No</span>}</TableCell>
                  <TableCell className="text-right">
                    <button data-testid={`edit-package-${pkg.id}`} onClick={() => openEdit(pkg)} className="p-1.5 rounded hover:bg-stone-100 text-stone-500 mr-1"><Pencil className="w-4 h-4" /></button>
                    <button data-testid={`delete-package-${pkg.id}`} onClick={() => handleDelete(pkg.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Package' : 'Create Package'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Name</label>
              <Input data-testid="pkg-name-input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Package name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">Category</label>
                <Select value={form.category} onValueChange={v => update('category', v)}>
                  <SelectTrigger data-testid="pkg-category-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">Price (Rs)</label>
                <Input data-testid="pkg-price-input" type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Guest Count</label>
              <Input data-testid="pkg-guest-input" type="number" value={form.guestCount} onChange={e => update('guestCount', e.target.value)} placeholder="Number of guests" />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Includes (comma separated)</label>
              <Textarea data-testid="pkg-includes-input" value={form.includes} onChange={e => update('includes', e.target.value)} placeholder="Hall, Sound System, Parking" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Extras (comma separated)</label>
              <Textarea data-testid="pkg-extras-input" value={form.extras} onChange={e => update('extras', e.target.value)} placeholder="Photography, DJ" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Notes</label>
              <Input data-testid="pkg-notes-input" value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Additional notes" />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Image URL</label>
              <Input data-testid="pkg-image-input" value={form.image} onChange={e => update('image', e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch data-testid="pkg-featured-switch" checked={form.isFeatured} onCheckedChange={v => update('isFeatured', v)} />
              <label className="text-sm text-stone-700">Featured Package</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setDialogOpen(false)} className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50">Cancel</button>
              <button type="submit" data-testid="save-package-btn" className="flex-1 py-2.5 rounded-lg bg-red-800 text-white text-sm font-medium hover:bg-red-900">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
