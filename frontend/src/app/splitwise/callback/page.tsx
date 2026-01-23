'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SplitwiseService } from '@/services/splitwise';

export default function SplitwiseCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Verifying...');

    useEffect(() => {
        const oauth_token = searchParams.get('oauth_token');
        const oauth_verifier = searchParams.get('oauth_verifier');

        // Retrieve secret from temp storage (we need it for step 2)
        const oauth_token_secret = localStorage.getItem('splitwise_temp_secret');

        if (oauth_token && oauth_verifier && oauth_token_secret) {
            handleCallback(oauth_token, oauth_verifier, oauth_token_secret);
        } else {
            setStatus('Error: Missing tokens or session expired.');
        }
    }, [searchParams]);

    const handleCallback = async (token: string, verifier: string, secret: string) => {
        try {
            setStatus('Exchanging tokens...');
            const { access_token, access_token_secret } = await SplitwiseService.getAccessToken(token, verifier, secret);

            setStatus('Fetching expenses...');
            const data = await SplitwiseService.getExpenses(access_token, access_token_secret);

            console.log('Splitwise Data:', data);

            // Store in localStorage
            localStorage.setItem('splitwise_context', JSON.stringify(data.expenses));
            localStorage.setItem('izaas_integrations', JSON.stringify({ splitwise: true }));

            // Cleanup temp secret
            localStorage.removeItem('splitwise_temp_secret');

            setStatus('Sync complete! Redirecting...');
            setTimeout(() => {
                router.push('/');
            }, 1000);

        } catch (error) {
            console.error(error);
            setStatus('Failed to sync. Check console.');
        }
    };

    return (
        <div className="stealth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', color: '#fff' }}>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', marginBottom: '1rem' }}>SPLITWISE SYNC</h1>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{status}</p>
        </div>
    );
}
