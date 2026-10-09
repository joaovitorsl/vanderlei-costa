export const demoKeys = {students:'vc-students-v3', schedule:'vc-schedule-v3', copies:'vc-week-copies-v5'};

export function resetDemo(url: URL, storage: Pick<Storage, 'removeItem'>, replace: (url: string) => void): boolean {
  if (url.searchParams.get('resetDemo') !== '1') return false;
  for (const key of Object.values(demoKeys)) {
    try { storage.removeItem(key); } catch { /* Seed still loads for this session. */ }
  }
  url.searchParams.delete('resetDemo');
  replace(url.pathname + url.search + url.hash);
  return true;
}
