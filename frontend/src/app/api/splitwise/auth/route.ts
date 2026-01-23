import { NextResponse } from 'next/server';
import { oauth, SPLITWISE_API_BASE } from '@/lib/splitwise';

export async function GET() {
    console.log("Splitwise Auth Start. Keys present:", !!process.env.SPLITWISE_CONSUMER_KEY, !!process.env.SPLITWISE_CONSUMER_SECRET);

    // We add oauth_callback to data so it is signed.
    const callback_url = 'https://izaas.com/splitwise/callback';

    const request_data = {
        url: `${SPLITWISE_API_BASE}/get_request_token`,
        method: 'POST',
        data: {
            oauth_callback: callback_url
        }
    };

    const headers = oauth.toHeader(oauth.authorize(request_data));

    console.log("Request URL:", request_data.url);
    console.log("Auth Header:", headers);

    try {
        // Send with empty body, but strict headers
        const response = await fetch(request_data.url, {
            method: request_data.method,
            headers: {
                ...headers,
                'User-Agent': 'Splitwise-NextJS-Client/1.0',
                'Accept': '*/*'
            }
        });

        const text = await response.text();
        // Parse response: oauth_token=...&oauth_token_secret=...&oauth_callback_confirmed=true
        const params = new URLSearchParams(text);
        const oauth_token = params.get('oauth_token');
        const oauth_token_secret = params.get('oauth_token_secret');

        if (!oauth_token) {
            return NextResponse.json({
                error: 'Failed to get request token',
                details: text,
                debug_info: {
                    url: request_data.url,
                    method: request_data.method,
                    auth_header: headers,
                    body_param: '(none)',
                    secret_check: process.env.SPLITWISE_CONSUMER_SECRET ? process.env.SPLITWISE_CONSUMER_SECRET.substring(0, 5) : 'MISSING'
                }
            }, { status: 500 });
        }

        const authorize_url = `https://secure.splitwise.com/authorize?oauth_token=${oauth_token}`;

        return NextResponse.json({
            url: authorize_url,
            oauth_token_secret: oauth_token_secret
        });

    } catch (error) {
        return NextResponse.json({
            error: String(error),
            debug_info: {
                url: request_data.url,
                auth_header: headers,
                body_param: '(none)'
            }
        }, { status: 500 });
    }
}
