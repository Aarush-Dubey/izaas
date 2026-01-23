import { NextResponse } from 'next/server';
import { oauth, SPLITWISE_API_BASE } from '@/lib/splitwise';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const access_token = searchParams.get('access_token');
    const access_token_secret = searchParams.get('access_token_secret');
    const limit = searchParams.get('limit') || '100'; // Default to 100

    if (!access_token || !access_token_secret) {
        return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    const request_data = {
        url: `${SPLITWISE_API_BASE}/get_expenses?limit=${limit}`,
        method: 'GET',
    };

    const token = {
        key: access_token,
        secret: access_token_secret
    };

    const headers = oauth.toHeader(oauth.authorize(request_data, token));

    try {
        const response = await fetch(request_data.url, {
            method: request_data.method,
            headers: {
                ...headers
            }
        });

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json({ error: 'Upstream error', details: text }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
