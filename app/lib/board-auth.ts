import { cookies } from 'next/headers';
import { requireSecret } from '@/app/lib/server-secrets';

const BOARD_COOKIE = 'board_session';

export async function requireBoardSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const boardSecret = requireSecret('BOARD_SECRET');
  const sessionCookie = cookieStore.get(BOARD_COOKIE);
  return sessionCookie?.value === boardSecret;
}