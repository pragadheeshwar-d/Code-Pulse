import { Context, Next } from 'hono';
import { jwtVerify, SignJWT } from 'jose';
import { AppEnv } from '../types';

export const requireAuth = async (c: Context<AppEnv>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const decoded = await jwtVerify(token, secret);
    
    if (!decoded.payload.userId) {
      return c.json({ error: 'Invalid token payload' }, 401);
    }
    
    c.set('userId', decoded.payload.userId as string);
    c.set('user', {
      userId: decoded.payload.userId as string,
      email: decoded.payload.email as string | undefined,
      name: decoded.payload.name as string | undefined
    });
    
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized', details: 'Invalid or expired token' }, 401);
  }
};

export const signToken = async (payload: { userId: string; email?: string; name?: string }, secret: string): Promise<string> => {
  const secretKey = new TextEncoder().encode(secret);
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
    
  return jwt;
};
