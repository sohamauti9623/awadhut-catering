import { useEffect, useState } from 'react';
import { Trash2, Check, Star, MessageSquare } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth to get the admin token
import api from '../../lib/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Access the logged-in admin user

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Gets all reviews (approved & pending)
      const r = await api.get('/reviews');
      setReviews(r.data);
    } catch (err) {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const approveReview = async (id) => {
    try {
      // Added Auth Header: Admin only action
      await api.put(`/reviews/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success('Review approved and visible to public');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to approve review');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      // Added Auth Header: Admin only action
      await api.delete(`/reviews/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Review Moderation</h1>
        <p className="text-stone-500 text-sm">Manage customer feedback and testimonials.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full bg-stone-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-stone-200 rounded-2xl">
          <MessageSquare className="w-12 h-12 text-stone-300 mb-4" />
          <p className="text-stone-500 font-medium">No reviews found in the database.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-stone-50">
              <TableRow>
                <TableHead className="w-[200px]">Customer</TableHead>
                <TableHead className="w-[120px]">Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r.id} className="hover:bg-stone-50/50 transition-colors">
                  <TableCell>
                    <div className="font-semibold text-stone-900">{r.name}</div>
                    <div className="text-xs text-stone-400 capitalize">{r.eventType || 'General'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'}`} 
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-stone-600 max-w-md">
                    <p className="line-clamp-2 italic">"{r.comment}"</p>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      r.approved 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                    }`}>
                      {r.approved ? 'Live' : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!r.approved && (
                        <button 
                          onClick={() => approveReview(r.id)} 
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteReview(r.id)} 
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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