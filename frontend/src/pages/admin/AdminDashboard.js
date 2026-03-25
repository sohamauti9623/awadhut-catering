import { useEffect, useState } from 'react';
import { Package, Image, CalendarDays, Star, MessageSquare, TrendingUp, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: ensure this matches your AuthContext prefix (/api)
    api.get('/dashboard/stats') 
      .then(r => { 
        setStats(r.data); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 rounded-xl bg-stone-100 animate-pulse" />)}
      </div>
    );
  }

  const cards = [
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: CalendarDays, color: 'text-blue-600 bg-blue-50', sub: `${stats?.pendingBookings || 0} pending` },
    { title: 'Confirmed', value: stats?.confirmedBookings || 0, icon: TrendingUp, color: 'text-green-600 bg-green-50', sub: 'confirmed bookings' },
    { title: 'Packages', value: stats?.totalPackages || 0, icon: Package, color: 'text-amber-600 bg-amber-50', sub: 'active packages' },
    { title: 'Gallery Items', value: stats?.totalGallery || 0, icon: Image, color: 'text-purple-600 bg-purple-50', sub: 'photos uploaded' },
    { title: 'Reviews', value: stats?.totalReviews || 0, icon: Star, color: 'text-red-600 bg-red-50', sub: `${stats?.pendingReviews || 0} pending approval` },
    { title: 'Messages', value: stats?.totalMessages || 0, icon: MessageSquare, color: 'text-teal-600 bg-teal-50', sub: 'contact messages' },
    { title: 'Events', value: stats?.totalEvents || 0, icon: PartyPopper, color: 'text-orange-600 bg-orange-50', sub: 'upcoming events' },
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-900">Dashboard Overview</h1>
        <p className="text-sm text-stone-500 mt-1">Welcome back! Here's what's happening with your business.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <Card key={i} data-testid={`stat-card-${i}`} className="border border-stone-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">{card.title}</CardTitle>
              <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-stone-900">{card.value}</p>
              <p className="text-xs text-stone-400 mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}