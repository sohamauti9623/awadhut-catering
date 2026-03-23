import { useEffect, useState } from 'react';
import { Trash2, Check, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    api.get('/bookings').then(r => { setBookings(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status?status=${status}`);
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking deleted');
      fetchBookings();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const statusColor = (s) => {
    switch(s) {
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div data-testid="admin-bookings">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-900">Bookings</h1>
        <p className="text-sm text-stone-500">Manage event booking requests</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-stone-100 animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-stone-400">No bookings yet.</div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(b => (
                <TableRow key={b.id} data-testid={`booking-row-${b.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-stone-900 text-sm">{b.name}</p>
                      <p className="text-xs text-stone-400">{b.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{b.phone}</TableCell>
                  <TableCell className="capitalize text-sm">{b.eventType}</TableCell>
                  <TableCell className="text-sm">{b.eventDate}</TableCell>
                  <TableCell className="text-sm">{b.guests}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full border capitalize ${statusColor(b.status)}`}>{b.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select value={b.status} onValueChange={v => updateStatus(b.id, v)}>
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <button onClick={() => handleDelete(b.id)} className="ml-2 p-1.5 rounded hover:bg-red-50 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
