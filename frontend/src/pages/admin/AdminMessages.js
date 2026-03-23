import { useEffect, useState } from 'react';
import { Trash2, Mail, Phone } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contacts').then(r => { setMessages(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div data-testid="admin-messages">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-900">Messages</h1>
        <p className="text-sm text-stone-500">Contact form submissions</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-stone-100 animate-pulse" />)}</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-stone-400">No messages yet.</div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} data-testid={`message-card-${msg.id}`} className="p-5 rounded-lg border border-stone-200 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-stone-900 text-sm">{msg.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-stone-400"><Mail className="w-3 h-3" />{msg.email}</span>
                    {msg.phone && <span className="flex items-center gap-1 text-xs text-stone-400"><Phone className="w-3 h-3" />{msg.phone}</span>}
                  </div>
                </div>
                <span className="text-xs text-stone-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
              </div>
              {msg.subject && <p className="text-sm font-medium text-stone-700 mb-1">{msg.subject}</p>}
              <p className="text-sm text-stone-600">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
