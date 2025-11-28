// lib/build-safe-auth.ts
export function isBuildTime(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build' || 
         (typeof window === 'undefined' && process.env.NODE_ENV === 'production');
}

export async function buildSafeAsync<T>(callback: () => Promise<T>): Promise<T | null> {
  if (isBuildTime()) {
    console.log('🏗️ Build mode - skipping auth operation');
    return null;
  }
  return await callback();
}