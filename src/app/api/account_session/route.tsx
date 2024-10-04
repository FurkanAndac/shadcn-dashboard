const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

import { NextApiRequest, NextApiResponse } from 'next';

import { NextRequest, NextResponse } from 'next/server';

interface AccountSession {
  client_secret: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(req: NextRequest) {
  try {
    const accountSession = await stripe.accountSessions.create({
      account: 'acct_1Q6IMwQOHiou3ahn',
      components: {
        payments: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
          },
        },
      },
    });

    return NextResponse.json({
      client_secret: accountSession.client_secret,
    });
  } catch (error) {
    console.error('An error occurred when calling the Stripe API to create an account session', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}