import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const consumer_key = process.env.SPLITWISE_CONSUMER_KEY!;
const consumer_secret = process.env.SPLITWISE_CONSUMER_SECRET!;

export const oauth = new OAuth({
    consumer: { key: consumer_key, secret: consumer_secret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
        return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64');
    },
});

export const SPLITWISE_API_BASE = 'https://secure.splitwise.com/api/v3.0';
