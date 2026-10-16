export function canDiscoverProfile(input: { viewerId: string; profileId: string; active: boolean; blockedPairs: Array<[string, string]> }) {
  if (!input.active || input.viewerId === input.profileId) return false;
  return !input.blockedPairs.some(([first, second]) =>
    (first === input.viewerId && second === input.profileId) || (second === input.viewerId && first === input.profileId),
  );
}
