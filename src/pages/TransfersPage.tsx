import { useEffect, useMemo, useState } from 'react';
import { transferService, CreateTransferData } from '../services/transfer';
import { Transfer } from '../types';
import { Plus, Loader2 } from 'lucide-react';

export function TransfersPage() {
  const [items, setItems] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateTransferData>({
    recipientName: '',
    amount: 0,
    purpose: '',
    destinationCountry: 'US',
    transferMethod: 'bank',
    fees: 0,
    exchangeRate: undefined,
  });

  const canSubmit = useMemo(() => {
    return (
      form.recipientName.trim().length > 0 &&
      form.amount > 0 &&
      form.purpose.trim().length > 0 &&
      form.destinationCountry.trim().length === 2 &&
      form.transferMethod.trim().length > 0 &&
      form.fees >= 0
    );
  }, [form]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transferService.getTransfers({ limit: 20 });
      setItems(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: ['amount', 'fees', 'exchangeRate'].includes(name) ? (value === '' ? undefined : Number(value)) : value,
    } as any));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setCreating(true);
    setError(null);
    try {
      const created = await transferService.createTransfer(form);
      setItems((prev) => [created, ...prev]);
      setForm({ recipientName: '', amount: 0, purpose: '', destinationCountry: 'US', transferMethod: 'bank', fees: 0, exchangeRate: undefined });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create transfer');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Money Transfers</h1>
        <p className="text-gray-600">Send money internationally</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card order-2 lg:order-1">
          <div className="card-header">
            <h2 className="card-title">Recent Transfers</h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="py-8 flex items-center justify-center text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
              </div>
            ) : items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transfers yet</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((t) => (
                  <li key={t.id} className="py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{t.recipientName} • {t.destinationCountry}</p>
                      <p className="text-sm text-gray-500 truncate">{t.purpose}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        t.status === 'completed' ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' :
                        t.status === 'failed' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20' :
                        'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                      }`}>{t.status}</span>
                      <span className="text-sm font-semibold text-gray-900">${t.amount.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        </div>

        <div className="card order-1 lg:order-2">
          <div className="card-header">
            <h2 className="card-title">New Transfer</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient name</label>
                <input name="recipientName" value={form.recipientName} onChange={handleChange} className="mt-1 input" placeholder="John Doe" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input name="amount" type="number" step="0.01" min={0} value={form.amount} onChange={handleChange} className="mt-1 input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fees</label>
                  <input name="fees" type="number" step="0.01" min={0} value={form.fees} onChange={handleChange} className="mt-1 input" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                <input name="purpose" value={form.purpose} onChange={handleChange} className="mt-1 input" placeholder="Family support" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination country</label>
                  <input name="destinationCountry" value={form.destinationCountry} onChange={handleChange} className="mt-1 input uppercase" placeholder="US" maxLength={2} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Method</label>
                  <select name="transferMethod" value={form.transferMethod} onChange={handleChange} className="mt-1 input">
                    <option value="bank">Bank</option>
                    <option value="wallet">Wallet</option>
                    <option value="wire">Wire</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Exchange rate (optional)</label>
                <input name="exchangeRate" type="number" step="0.0001" min={0} value={form.exchangeRate ?? ''} onChange={handleChange} className="mt-1 input" placeholder="e.g. 82.15" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={!canSubmit || creating} className="btn btn-primary inline-flex items-center">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Create transfer
                </button>
              </div>
            </form>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}