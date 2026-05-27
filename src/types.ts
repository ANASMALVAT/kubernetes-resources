export type CategoryId =
  | 'cluster'
  | 'workload'
  | 'network'
  | 'config'
  | 'storage'
  | 'identity';

export type Scope = 'cluster' | 'namespace';

export interface Category {
  id: CategoryId;
  label: string;
  hex: string;
  threeColor: number;
  text: string;
  bg: string;
  border: string;
  glow: string;
}

export interface ResourceLink {
  name: string;
  via: string;
}

export interface KeyField {
  name: string;
  desc: string;
}

export interface Resource {
  id: string;
  name: string;
  icon: string;
  category: CategoryId;
  scope: Scope;
  oneliner: string;
  description: string;
  keyFields: KeyField[];
  references: ResourceLink[];
  referencedBy: ResourceLink[];
  example: string;
  tip: string;
}

export interface Tier {
  id: number;
  label: string;
  description: string;
  y: number;
  radius: number;
  resourceIds: string[];
}

export type View = 'universe' | 'grid';
