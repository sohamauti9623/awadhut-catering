import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'; // Added Upload icon
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import api from '../../lib/api';

const emptyEvent = { title: '', description: '', eventDate: '', eventTime: '', venue: 'Awadhut Banquets, Latur', image: '', price: '', capacity: '', isActive: true };

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEvent);
  const [uploading, setUploading] = useState(false); // New uploading state

  const fetchEvents = () => {
    setLoading(true);
    api.get('/events').then(r => { setEvents(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  // --- Same Cloudinary Logic as AdminGallery ---
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const sigRes = await api.get('/cloudinary/signature?folder=awadhut-events');
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
        setForm(prev => ({ ...prev, image: data.secure_url })); // Sets the "image" field
        toast.success('Event image uploaded!');
      } else {
        toast.error('Upload failed. Please enter URL manually.');
      }
    } catch (err) {
      toast.error('Cloudinary upload failed.');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
    };

    try {
      if (editing) {
        await api.put(`/events/${editing}`, payload);
        toast.success('Event updated');
      } else {
        await api.post('/events', payload);
        toast.success('Event created');
      }
      setDialogOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events Management</h1>
        <button onClick={() => { setEditing(null); setForm(emptyEvent); setDialogOpen(true); }} className="bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-900 transition-colors">
          <Plus size={18} /> Add Event
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4"><div className="h-12 bg-stone-100 rounded w-full"></div></div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map(event => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.eventDate}</TableCell>
                  <TableCell>{event.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-right">
                    <button onClick={() => { setEditing(event.id); setForm(event); setDialogOpen(true); }} className="p-2 hover:bg-stone-100 rounded-lg mr-2"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Event' : 'Create New Event'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="text-xs font-bold uppercase text-stone-500 mb-1 block">Title</label>
               <Input placeholder="Event Title" value={form.title} onChange={e => update('title', e.target.value)} required />
            </div>
            
            <Textarea placeholder="Description" value={form.description} onChange={e => update('description', e.target.value)} />
            
            <div className="grid grid-cols-2 gap-4">
              <Input type="date" value={form.eventDate} onChange={e => update('eventDate', e.target.value)} required />
              <Input type="time" value={form.eventTime} onChange={e => update('eventTime', e.target.value)} />
            </div>

            {/* --- NEW: Cloudinary Upload Section --- */}
            <div>
              <label className="text-xs font-bold uppercase text-stone-500 mb-1 block">Event Image</label>
              <div className="flex gap-2 mb-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-stone-200 text-sm text-stone-600 cursor-pointer hover:bg-stone-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Choose File'}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <Input placeholder="Or paste image URL" value={form.image} onChange={e => update('image', e.target.value)} />
              {form.image && (
                <div className="mt-2 relative rounded-lg overflow-hidden border border-stone-200 aspect-video">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Input type="number" placeholder="Price (₹)" value={form.price} onChange={e => update('price', e.target.value)} />
               <Input type="number" placeholder="Capacity" value={form.capacity} onChange={e => update('capacity', e.target.value)} />
            </div>

            <div className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg">
              <Switch checked={form.isActive} onCheckedChange={v => update('isActive', v)} />
              <span className="text-sm font-medium text-stone-600">Visible to Public</span>
            </div>

            <button type="submit" className="w-full bg-red-800 text-white py-2.5 rounded-lg font-semibold hover:bg-red-900 transition-colors">
              {editing ? 'Update Event' : 'Create Event'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}