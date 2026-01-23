import { NextResponse } from 'next/server';
import { oauth, SPLITWISE_API_BASE } from '@/lib/splitwise';

export async function POST(request: Request) {
    const body = await request.json();
    const { oauth_token, oauth_verifier, oauth_token_secret } = body;

    if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
        return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
    }

    const request_data = {
        url: `${SPLITWISE_API_BASE}/get_access_token`,
        method: 'POST',
        data: { oauth_verifier }
    };

    // For the access token step, we sign with the token secret we got in step 1
    const token = {
        key: oauth_token,
        secret: oauth_token_secret
    };

    const headers = oauth.toHeader(oauth.authorize(request_data, token));

    try {
        // Need to send oauth_verifier in body or query? Splitwise docs say 'oauth_verifier' parameter.
        // OAuth 1.0a usually expects it in the signed params, but we passed it in `data`. 
        // And libraries often put it in the Authorization header or body depending on setup.
        // oauth-1.0a lib includes `data` in signature. We need to send `data` in body too if POST?
        // Actually, `oauth-1.0a` just signs. We need to fetch.

        // We append oauth_verifier to URL for Safety or Body. Splitwise accepts post body.
        // But fetch doesn't auto-form-encode.

        // Let's use form-urlencoded body
        const formBody = new URLSearchParams();
        formBody.append('oauth_verifier', oauth_verifier);

        const response = await fetch(request_data.url, {
            method: request_data.method,
            headers: {
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formBody
        });

        const text = await response.text();
        const params = new URLSearchParams(text);
        const access_token = params.get('oauth_token');
        const access_token_secret = params.get('oauth_token_secret');

        if (!access_token) {
            return NextResponse.json({ error: 'Failed to get access token', details: text }, { status: 500 });
        }

        // Return the permanent access tokens to the client (to be stored in localStorage)
        return NextResponse.json({
            access_token,
            access_token_secret
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
