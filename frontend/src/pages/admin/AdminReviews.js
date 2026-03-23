import { useEffect, useState } from 'react';
import { Trash2, Check, Star } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    api.get('/reviews').then(r => { setReviews(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const approveReview = async (id) => {
    try {
      await api.put(`/reviews/${id}/approve`);
      toast.success('Review approved');
      fetchReviews();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div data-testid="admin-reviews">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-900">Reviews</h1>
        <p className="text-sm text-stone-500">Moderate customer reviews</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-stone-100 animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-stone-400">No reviews yet.</div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map(r => (
                <TableRow key={r.id} data-testid={`review-row-${r.id}`}>
                  <TableCell className="font-medium text-sm text-stone-900">{r.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-stone-600 max-w-xs truncate">{r.comment}</TableCell>
                  <TableCell className="text-sm capitalize">{r.eventType || '-'}</TableCell>
                  <TableCell>
                    {r.approved ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">Approved</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!r.approved && (
                      <button data-testid={`approve-review-${r.id}`} onClick={() => approveReview(r.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600 mr-1">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button data-testid={`delete-review-${r.id}`} onClick={() => deleteReview(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
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
