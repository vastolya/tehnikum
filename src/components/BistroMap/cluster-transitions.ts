import type { LngLat } from "@/lib/maplibre-browser";
import type { PointCluster } from "./cluster-points";

export const CLUSTER_TRANSITION_MS = 400;

export type LocatedCluster = PointCluster & { coordinates: LngLat };
export type TransitionCluster = LocatedCluster & {
  from?: LngLat;
  exitTo?: LngLat;
};

export function clusterKey(cluster: PointCluster): string {
  return [...cluster.ids].sort().join("|");
}

function relatedCluster(cluster: PointCluster, candidates: LocatedCluster[]) {
  return candidates.reduce<LocatedCluster | undefined>((best, candidate) => {
    const overlap = candidate.ids.filter((id) => cluster.ids.includes(id)).length;
    const bestOverlap = best?.ids.filter((id) => cluster.ids.includes(id)).length ?? 0;
    return overlap > bestOverlap ? candidate : best;
  }, undefined);
}

// Keep outgoing groups alive until their markers have reached the new group.
// Stable keys also let a quick reverse zoom reuse a marker mid-animation.
export function transitionClusters(previous: TransitionCluster[], next: LocatedCluster[]): TransitionCluster[] {
  const activePrevious = previous.filter((cluster) => !cluster.exitTo);
  const incoming = next.map((cluster): TransitionCluster => {
    const existing = previous.find((item) => clusterKey(item) === clusterKey(cluster));
    if (existing) return { ...cluster, from: existing.from };
    const origin = relatedCluster(cluster, activePrevious);
    return { ...cluster, from: origin?.coordinates };
  });
  const outgoing = previous
    .filter((cluster) => !next.some((item) => clusterKey(item) === clusterKey(cluster)))
    .map((cluster) => ({ ...cluster, exitTo: relatedCluster(cluster, next)?.coordinates }));
  return [...incoming, ...outgoing];
}
