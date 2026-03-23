import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Wedding', imageUrl: '', description: '' });
  const [uploading, setUploading] = useState(false);

  const fetchGallery = () => {
    api.get('/gallery').then(r => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Try Cloudinary signed upload
      const sigRes = await api.get('/cloudinary/signature?folder=awadhut-gallery');
      const sig = sigRes.data;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', sig.timestamp);
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);
      
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, { method: 'POST', body: formData });
      const data = await uploadRes.json();
      if (data.secure_url) {
        setForm(prev => ({ ...prev, imageUrl: data.secure_url }));
        toast.success('Image uploaded to Cloudinary!');
      } else {
        toast.error('Upload failed. Please enter URL manually.');
      }
    } catch {
      toast.error('Cloudinary not configured. Please enter image URL manually.');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) { toast.error('Title and image URL are required'); return; }
    try {
      await api.post('/gallery', form);
      toast.success('Gallery item added');
      setDialogOpen(false);
      setForm({ title: '', category: 'Wedding', imageUrl: '', description: '' });
      fetchGallery();
    } catch {
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gallery item?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success('Item deleted');
      fetchGallery();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div data-testid="admin-gallery">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Gallery</h1>
          <p className="text-sm text-stone-500">Manage your event photos</p>
        </div>
        <button
          data-testid="add-gallery-btn"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 bg-red-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-900 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="aspect-square rounded-lg bg-stone-100 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-stone-400">No gallery items yet. Add your first photo!</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} data-testid={`gallery-admin-item-${item.id}`} className="relative group rounded-lg overflow-hidden border border-stone-200">
              <img src={item.imageUrl} alt={item.title} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center text-white px-2">
                  <p className="text-sm font-medium mb-1">{item.title}</p>
                  <p className="text-xs text-stone-300">{item.category}</p>
                  <button
                    data-testid={`delete-gallery-${item.id}`}
                    onClick={() => handleDelete(item.id)}
                    className="mt-2 p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Gallery Photo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Title</label>
              <Input data-testid="gallery-title-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Photo title" />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Category</label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wedding">Wedding</SelectItem>
                  <SelectItem value="Decoration">Decoration</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Upload Image</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 cursor-pointer hover:bg-stone-50">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Choose File'}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Image URL</label>
              <Input data-testid="gallery-url-input" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." />
              {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />}
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Description</label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setDialogOpen(false)} className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50">Cancel</button>
              <button type="submit" data-testid="save-gallery-btn" className="flex-1 py-2.5 rounded-lg bg-red-800 text-white text-sm font-medium hover:bg-red-900">Add Photo</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
