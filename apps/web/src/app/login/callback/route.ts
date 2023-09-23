import { getSession } from "@/session";
import { NextRequest, NextResponse } from "next/server";
import { Issuer, generators } from "openid-client";
import { AuthSession } from "../authTypes";
import { redirect } from "next/navigation";


export async function GET(req: NextRequest) {
    const res = new NextResponse();
    const sigarraIssuer = await Issuer.discover('https://open-id.up.pt/realms/sigarra');

    const client = new sigarraIssuer.Client({
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uris: [process.env.CALLBACK_URL!],
        response_types: ['code'],
        // id_token_signed_response_alg (default "RS256")
        // token_endpoint_auth_method (default "client_secret_basic")
    }); // => Client
    const session = await getSession<AuthSession>(req, res, 'authSession');


    const params = client.callbackParams(req.url);

    console.log(session.codeVerifier)

    const tokenSet = await client.callback(process.env.CALLBACK_URL, params, { code_verifier: session.codeVerifier});
    console.log('received and validated tokens %j', tokenSet);
    console.log('validated ID Token claims %j', tokenSet.claims());

    return redirect('/merch');

}