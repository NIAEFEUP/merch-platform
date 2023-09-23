import { getSession } from "@/session";
import { NextRequest, NextResponse } from "next/server";

import { Issuer } from 'openid-client';
import { generators } from 'openid-client';
import { AuthSession } from "./authTypes";


export async function GET(req: NextRequest) {
    const sigarraIssuer = await Issuer.discover('https://open-id.up.pt/realms/sigarra');

    const client = new sigarraIssuer.Client({
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uris: [process.env.CALLBACK_URL!],
        response_types: ['code'],
        // id_token_signed_response_alg (default "RS256")
        // token_endpoint_auth_method (default "client_secret_basic")
    }); // => Client

    const code_verifier = generators.codeVerifier();
    // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
    // it should be httpOnly (not readable by javascript) and encrypted.



    const code_challenge = generators.codeChallenge(code_verifier);

    const url = client.authorizationUrl({
        scope: 'openid email profile',
        code_challenge,
        code_challenge_method: 'S256',
    });
    
    const res = NextResponse.redirect(url);    
    const session = await getSession<AuthSession>(req, res, 'authSession');
    session.codeVerifier = code_verifier;
    await session.save();
    // Redirect to login page
    return res;
}
