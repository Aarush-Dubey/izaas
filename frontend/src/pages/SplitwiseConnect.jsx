import React, { useState } from 'react';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const SplitwiseConnect = () => {
    const [formData, setFormData] = useState({ user_id: '', api_key: '' });
    const [status, setStatus] = useState(null); // 'success' | 'error' | 'loading'
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await api.post('splitwise/connect/', formData);
            setStatus('success');
            setMessage('Successfully connected to Splitwise!');
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Failed to connect. Check your credentials.');
        }
    };

    const handleSync = async () => {
        setStatus('loading');
        try {
            const res = await api.post('splitwise/sync/', { user_id: formData.user_id });
            setStatus('success');
            setMessage(`Sync complete! Processed ${res.data.synced} expenses.`);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Sync failed.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Wallet className="text-primary" size={32} />
                    Connect Splitwise
                </h2>
                <p className="text-gray-400">Link your account to sync expenses automatically.</p>
            </header>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">User ID (Internal)</label>
                        <input
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                            placeholder="e.g. uuid-..."
                            value={formData.user_id}
                            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Splitwise API Key</label>
                        <input
                            type="password"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                            placeholder="YOUR_API_KEY"
                            value={formData.api_key}
                            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="flex-1 bg-primary text-black font-semibold py-3 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                        >
                            Connect Account
                        </button>
                        {status === 'success' && (
                            <button
                                type="button"
                                onClick={handleSync}
                                className="flex-1 bg-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                Sync Now
                            </button>
                        )}
                    </div>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${status === 'success' ? 'bg-green-500/10 text-green-400' :
                            status === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                        {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SplitwiseConnect;
