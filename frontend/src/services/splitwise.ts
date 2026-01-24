export const SplitwiseService = {
    async getAuthUrl() {
        const res = await fetch('/api/splitwise/auth');
        if (!res.ok) throw new Error('Failed to get auth url');
        return res.json(); // { url, oauth_token_secret }
    },

    async getAccessToken(oauth_token: string, oauth_verifier: string, oauth_token_secret: string) {
        const res = await fetch('/api/splitwise/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oauth_token, oauth_verifier, oauth_token_secret })
        });
        if (!res.ok) throw new Error('Failed to exchange token');
        return res.json(); // { access_token, access_token_secret }
    },

    async getExpenses(access_token: string, access_token_secret: string) {
        const params = new URLSearchParams({ access_token, access_token_secret, limit: '1000' });
        const res = await fetch(`/api/splitwise/expenses?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch expenses');
        return res.json(); // { expenses: [...] }
    }
};
