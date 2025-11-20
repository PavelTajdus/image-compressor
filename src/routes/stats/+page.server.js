import { getStats } from '$lib/db';

export function load() {
  return {
    stats: getStats()
  };
}
