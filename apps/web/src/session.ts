import { getIronSession, createResponse } from 'iron-session'

  
export const getSession = <T extends Object>(req: Request, res: Response, cookieName : string) => {
  const session = getIronSession<T>(req, res, {
    password: process.env.SESSION_SECRET!,
    cookieName: cookieName,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  })
  return session
}

export { createResponse }