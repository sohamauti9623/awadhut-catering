import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

  const fetchEvents = () => {
    api.get('/events').then(r => { setEvents(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyEvent); setDialogOpen(true); };

  const openEdit = (event) => {
    setEditing(event.id);
    setForm({
      title: event.title, description: event.description,
      eventDate: event.eventDate, eventTime: event.eventTime || '',
      venue: event.venue, image: event.image || '',
      price: event.price ? event.price.toString() : '',
      capacity: event.capacity ? event.capacity.toString() : '',
      isActive: event.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.eventDate) { toast.error('Title and date are required'); return; }
    const payload = {
      title: form.title, description: form.description,
      eventDate: form.eventDate, eventTime: form.eventTime,
      venue: form.venue, image: form.image,
      price: form.price ? parseFloat(form.price) : null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      isActive: form.isActive,
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
    <div data-testid="admin-events">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Events</h1>
          <p className="text-sm text-stone-500">Manage upcoming events and celebrations</p>
        </div>
        <button
          data-testid="add-event-btn"
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-900 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 rounded-lg bg-stone-100 animate-pulse" />)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-stone-400">No events yet. Create your first event!</div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map(event => (
                <TableRow key={event.id} data-testid={`event-row-${event.id}`}>
                  <TableCell className="font-medium text-stone-900">{event.title}</TableCell>
                  <TableCell className="text-sm">{event.eventDate}{event.eventTime ? ` at ${event.eventTime}` : ''}</TableCell>
                  <TableCell className="text-sm text-stone-500">{event.venue}</TableCell>
                  <TableCell className="text-sm">{event.price ? `Rs ${event.price.toLocaleString('en-IN')}` : 'Free'}</TableCell>
                  <TableCell>
                    {event.isActive ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">Active</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-500">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <button data-testid={`edit-event-${event.id}`} onClick={() => openEdit(event)} className="p-1.5 rounded hover:bg-stone-100 text-stone-500 mr-1"><Pencil className="w-4 h-4" /></button>
                    <button data-testid={`delete-event-${event.id}`} onClick={() => handleDelete(event.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
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
            <DialogTitle>{editing ? 'Edit Event' : 'Create Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Event Title *</label>
              <Input data-testid="event-title-input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g., Holi Celebration 2026" />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Description</label>
              <Textarea data-testid="event-desc-input" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe the event..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">Event Date *</label>
                <Input data-testid="event-date-input" type="date" value={form.eventDate} onChange={e => update('eventDate', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">Time</label>
                <Input data-testid="event-time-input" value={form.eventTime} onChange={e => update('eventTime', e.target.value)} placeholder="e.g., 6:00 PM onwards" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Venue</label>
              <Input value={form.venue} onChange={e => update('venue', e.target.value)} placeholder="Venue location" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">Price (Rs)</label>
                <Input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0 for free" />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">Capacity</label>
                <Input type="number" value={form.capacity} onChange={e => update('capacity', e.target.value)} placeholder="Max people" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Event Image URL</label>
              <Input value={form.image} onChange={e => update('image', e.target.value)} placeholder="https://..." />
              {form.image && <img src={form.image} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={v => update('isActive', v)} />
              <label className="text-sm text-stone-700">Active (visible to public)</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setDialogOpen(false)} className="flex-1 py-2.5 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50">Cancel</button>
              <button type="submit" data-testid="save-event-btn" className="flex-1 py-2.5 rounded-lg bg-red-800 text-white text-sm font-medium hover:bg-red-900">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
