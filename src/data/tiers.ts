import type { Tier } from '../types';

/**
 * The 3D scene is organized as 7 vertical tiers. Reading top-to-bottom is
 * roughly the path of an external request reaching a Pod, then the things
 * the Pod depends on. Each tier sits at a fixed Y coordinate so the
 * hierarchy is visible at a glance.
 */
export const tiers: Tier[] = [
  {
    id: 1,
    label: 'Classes & Org',
    description: 'Cluster-wide blueprints — pick the engine, group resources.',
    y: 18,
    radius: 9,
    resourceIds: ['namespace', 'ingressclass', 'gatewayclass', 'storageclass'],
  },
  {
    id: 2,
    label: 'External Entry',
    description: 'How HTTP traffic enters the cluster.',
    y: 12,
    radius: 6.5,
    resourceIds: ['ingress', 'gateway', 'httproute'],
  },
  {
    id: 3,
    label: 'Service Layer',
    description: 'Stable in-cluster address for a set of Pods.',
    y: 6,
    radius: 0,
    resourceIds: ['service'],
  },
  {
    id: 4,
    label: 'Workload Controllers',
    description: 'Create and manage Pods — the things you actually deploy.',
    y: 0,
    radius: 8,
    resourceIds: ['deployment', 'statefulset', 'daemonset', 'replicaset', 'job', 'cronjob'],
  },
  {
    id: 5,
    label: 'Pod',
    description: 'The atomic compute unit — runs one or more containers.',
    y: -6,
    radius: 0,
    resourceIds: ['pod'],
  },
  {
    id: 6,
    label: 'Pod Dependencies',
    description: 'What a Pod consumes at runtime: config, identity, storage.',
    y: -12,
    radius: 7,
    resourceIds: ['configmap', 'secret', 'serviceaccount', 'pvc'],
  },
  {
    id: 7,
    label: 'Backing Infrastructure',
    description: 'Real storage and RBAC primitives the cluster admin manages.',
    y: -18,
    radius: 10,
    resourceIds: ['pv', 'role', 'rolebinding', 'clusterrole', 'clusterrolebinding'],
  },
];

export function findTierForResource(resourceId: string): Tier | undefined {
  return tiers.find((t) => t.resourceIds.includes(resourceId));
}
