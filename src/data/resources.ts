import type { Resource } from '../types';

export const resources: Resource[] = [
  {
    id: 'namespace',
    name: 'Namespace',
    icon: '📂',
    category: 'cluster',
    scope: 'cluster',
    oneliner: 'Isolated workspace for grouping resources',
    description:
      'A virtual partition within the cluster. Groups related resources (one per app/team/env) and isolates them via RBAC and ResourceQuotas.',
    keyFields: [{ name: 'metadata.name', desc: 'The namespace identifier' }],
    references: [],
    referencedBy: [{ name: 'Almost everything', via: 'metadata.namespace' }],
    example: `apiVersion: v1
kind: Namespace
metadata:
  name: my-app`,
    tip: 'Cluster-scoped objects (ClusterRole, PV, StorageClass) live OUTSIDE namespaces. The default namespace is "default".',
  },
  {
    id: 'ingressclass',
    name: 'IngressClass',
    icon: '🏷️',
    category: 'cluster',
    scope: 'cluster',
    oneliner: 'Picks which Ingress controller handles routing',
    description:
      'A "phone-book card" mapping an Ingress\'s ingressClassName to the controller that implements it (nginx, gce, etc.).',
    keyFields: [
      { name: 'spec.controller', desc: 'The controller name (e.g. k8s.io/ingress-nginx)' },
    ],
    references: [{ name: 'Controller (external)', via: 'spec.controller' }],
    referencedBy: [{ name: 'Ingress', via: 'spec.ingressClassName' }],
    example: `apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: k8s.io/ingress-nginx`,
    tip: 'Usually auto-created when you install the controller via Helm. You rarely write it by hand.',
  },
  {
    id: 'gatewayclass',
    name: 'GatewayClass',
    icon: '🚪',
    category: 'cluster',
    scope: 'cluster',
    oneliner: 'Picks which Gateway controller implements your Gateway',
    description:
      'Gateway API equivalent of IngressClass. controllerName maps to the controller (Kong, GKE, Istio, etc.).',
    keyFields: [
      { name: 'spec.controllerName', desc: 'The controller that owns this class' },
    ],
    references: [{ name: 'Controller (external)', via: 'spec.controllerName' }],
    referencedBy: [{ name: 'Gateway', via: 'spec.gatewayClassName' }],
    example: `apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: kong
spec:
  controllerName: konghq.com/kic-gateway-controller`,
    tip: 'On GKE these are pre-installed. With Kong/Istio you create them yourself.',
  },
  {
    id: 'storageclass',
    name: 'StorageClass',
    icon: '💾',
    category: 'cluster',
    scope: 'cluster',
    oneliner: 'Picks which provisioner creates disks dynamically',
    description:
      'When a PVC references a StorageClass, the named provisioner creates a PV + underlying cloud disk automatically.',
    keyFields: [
      { name: 'provisioner', desc: 'CSI driver that creates the disk' },
      { name: 'reclaimPolicy', desc: 'Delete or Retain on PVC deletion' },
      { name: 'volumeBindingMode', desc: 'Immediate or WaitForFirstConsumer' },
      { name: 'allowVolumeExpansion', desc: 'Whether PVCs can be resized' },
    ],
    references: [{ name: 'CSI Provisioner', via: 'provisioner field' }],
    referencedBy: [
      { name: 'PersistentVolumeClaim', via: 'spec.storageClassName' },
      { name: 'PersistentVolume', via: 'spec.storageClassName' },
    ],
    example: `apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: civo-volume
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: csi.civo.com
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true`,
    tip: 'WaitForFirstConsumer delays PV creation until a Pod is scheduled — critical for zonal/local disks.',
  },
  {
    id: 'pv',
    name: 'PersistentVolume',
    icon: '🗄️',
    category: 'storage',
    scope: 'cluster',
    oneliner: 'A piece of real storage in the cluster',
    description:
      'Represents a physical disk (EBS, GCE PD, NFS, local). Created statically by admin, or dynamically by a StorageClass.',
    keyFields: [
      { name: 'spec.capacity.storage', desc: 'Disk size' },
      { name: 'spec.accessModes', desc: 'RWO / ROX / RWX / RWOP' },
      { name: 'spec.storageClassName', desc: 'Which class this PV belongs to' },
      { name: 'spec.nodeAffinity', desc: 'Pin to specific nodes (local PVs)' },
      { name: 'spec.persistentVolumeReclaimPolicy', desc: 'Delete or Retain' },
    ],
    references: [
      { name: 'Node', via: 'spec.nodeAffinity' },
      { name: 'StorageClass', via: 'spec.storageClassName' },
    ],
    referencedBy: [{ name: 'PersistentVolumeClaim', via: 'binds (labels/class/criteria)' }],
    example: `apiVersion: v1
kind: PersistentVolume
metadata:
  name: manual-kind-worker
  labels: { name: manual-kind }
spec:
  capacity: { storage: 100Mi }
  accessModes: [ReadWriteOnce]
  storageClassName: standard
  local: { path: /some/path/in/container }
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - { key: kubernetes.io/hostname, operator: In, values: [kind-worker] }`,
    tip: 'In production you almost never write PVs by hand — StorageClass does it. PV YAML is a teaching exercise.',
  },
  {
    id: 'clusterrole',
    name: 'ClusterRole',
    icon: '🛡️',
    category: 'identity',
    scope: 'cluster',
    oneliner: 'Cluster-wide set of API permissions',
    description:
      'A reusable bundle of permissions (verbs on resources) that applies cluster-wide.',
    keyFields: [
      { name: 'rules[].apiGroups', desc: 'Which API groups' },
      { name: 'rules[].resources', desc: 'Which resources' },
      { name: 'rules[].verbs', desc: 'get/list/watch/create/update/patch/delete' },
    ],
    references: [],
    referencedBy: [
      { name: 'ClusterRoleBinding', via: 'roleRef' },
      { name: 'RoleBinding', via: 'roleRef (scoped to its namespace)' },
    ],
    example: `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata: { name: pod-reader }
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]`,
    tip: 'Bind via RoleBinding (one namespace) or ClusterRoleBinding (cluster-wide).',
  },
  {
    id: 'clusterrolebinding',
    name: 'ClusterRoleBinding',
    icon: '🔗',
    category: 'identity',
    scope: 'cluster',
    oneliner: 'Grants a ClusterRole to subjects, cluster-wide',
    description:
      'Binds a ClusterRole to users / groups / ServiceAccounts at the cluster level.',
    keyFields: [
      { name: 'subjects', desc: 'Who gets the perms' },
      { name: 'roleRef', desc: 'Which ClusterRole' },
    ],
    references: [
      { name: 'ClusterRole', via: 'roleRef' },
      { name: 'ServiceAccount', via: 'subjects' },
    ],
    referencedBy: [],
    example: `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata: { name: read-pods-cluster }
subjects:
  - kind: ServiceAccount
    name: my-sa
    namespace: my-app
roleRef:
  kind: ClusterRole
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io`,
    tip: 'Use sparingly — grants in EVERY namespace. Prefer Role + RoleBinding when possible.',
  },
  {
    id: 'pod',
    name: 'Pod',
    icon: '📦',
    category: 'workload',
    scope: 'namespace',
    oneliner: 'The smallest deployable unit — runs containers',
    description:
      'A Pod runs one or more containers sharing network and storage. Almost never created directly in production.',
    keyFields: [
      { name: 'spec.containers', desc: 'List of containers' },
      { name: 'spec.volumes', desc: 'Volumes (configMap, secret, PVC, emptyDir)' },
      { name: 'spec.serviceAccountName', desc: 'Identity for API access (RBAC)' },
      { name: 'spec.nodeSelector / affinity', desc: 'Where to schedule' },
    ],
    references: [
      { name: 'ConfigMap', via: 'envFrom / volumes' },
      { name: 'Secret', via: 'envFrom / volumes' },
      { name: 'PersistentVolumeClaim', via: 'volumes.persistentVolumeClaim.claimName' },
      { name: 'ServiceAccount', via: 'spec.serviceAccountName' },
    ],
    referencedBy: [
      { name: 'Service', via: 'selector matches Pod labels' },
      { name: 'ReplicaSet', via: 'spec.template' },
      { name: 'Deployment', via: 'spec.template' },
      { name: 'StatefulSet', via: 'spec.template' },
      { name: 'DaemonSet', via: 'spec.template' },
      { name: 'Job', via: 'spec.template' },
    ],
    example: `apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels: { app: nginx }
spec:
  containers:
    - name: nginx
      image: nginx:1.26`,
    tip: 'Bare Pods are NOT self-healing. Use Deployment/StatefulSet/DaemonSet/Job so a controller replaces dead Pods.',
  },
  {
    id: 'replicaset',
    name: 'ReplicaSet',
    icon: '📑',
    category: 'workload',
    scope: 'namespace',
    oneliner: 'Ensures N Pod replicas exist (label-based)',
    description:
      'Maintains a desired number of Pod replicas. Usually managed by a Deployment — rarely created directly.',
    keyFields: [
      { name: 'spec.replicas', desc: 'Desired Pod count' },
      { name: 'spec.selector.matchLabels', desc: 'Which pods this RS owns' },
      { name: 'spec.template', desc: 'Pod template to clone' },
    ],
    references: [{ name: 'Pod', via: 'spec.template (creates Pods)' }],
    referencedBy: [{ name: 'Deployment', via: 'manages ReplicaSets' }],
    example: `apiVersion: apps/v1
kind: ReplicaSet
metadata: { name: nginx-rs }
spec:
  replicas: 3
  selector: { matchLabels: { app: nginx } }
  template:
    metadata: { labels: { app: nginx } }
    spec:
      containers: [{ name: nginx, image: nginx:1.26 }]`,
    tip: 'Almost always use Deployment instead — it manages ReplicaSets and gives you rolling updates + rollback.',
  },
  {
    id: 'deployment',
    name: 'Deployment',
    icon: '🚀',
    category: 'workload',
    scope: 'namespace',
    oneliner: 'Stateless apps with rolling updates & rollback',
    description:
      'Manages ReplicaSets for declarative updates, rolling deploys, and rollback. The default choice for stateless workloads.',
    keyFields: [
      { name: 'spec.replicas', desc: 'How many Pods' },
      { name: 'spec.strategy', desc: 'RollingUpdate / Recreate' },
      { name: 'spec.template', desc: 'Pod template' },
      { name: 'spec.revisionHistoryLimit', desc: 'Old RSes kept for rollback' },
    ],
    references: [
      { name: 'ReplicaSet', via: 'creates/owns them' },
      { name: 'Pod', via: 'spec.template' },
    ],
    referencedBy: [{ name: 'Service', via: 'selector matches Pod labels' }],
    example: `apiVersion: apps/v1
kind: Deployment
metadata: { name: nginx }
spec:
  replicas: 3
  selector: { matchLabels: { app: nginx } }
  template:
    metadata: { labels: { app: nginx } }
    spec:
      containers: [{ name: nginx, image: nginx:1.26 }]`,
    tip: 'kubectl rollout undo deployment/nginx — instant rollback to previous revision.',
  },
  {
    id: 'statefulset',
    name: 'StatefulSet',
    icon: '🏛️',
    category: 'workload',
    scope: 'namespace',
    oneliner: 'Stateful apps with stable identity & storage',
    description:
      'Like Deployment, but pods get stable ordinal names (db-0, db-1) and stable persistent storage via volumeClaimTemplates.',
    keyFields: [
      { name: 'spec.serviceName', desc: 'Headless Service for stable DNS' },
      { name: 'spec.volumeClaimTemplates', desc: 'Per-Pod PVCs auto-created' },
      { name: 'spec.podManagementPolicy', desc: 'OrderedReady / Parallel' },
      { name: 'spec.updateStrategy', desc: 'RollingUpdate / OnDelete' },
    ],
    references: [
      { name: 'Service', via: 'spec.serviceName (headless)' },
      { name: 'PersistentVolumeClaim', via: 'spec.volumeClaimTemplates' },
      { name: 'Pod', via: 'spec.template' },
    ],
    referencedBy: [],
    example: `apiVersion: apps/v1
kind: StatefulSet
metadata: { name: web }
spec:
  serviceName: nginx
  replicas: 3
  selector: { matchLabels: { app: nginx } }
  template:
    metadata: { labels: { app: nginx } }
    spec:
      containers:
        - name: nginx
          image: nginx:1.26
          volumeMounts: [{ name: www, mountPath: /usr/share/nginx/html }]
  volumeClaimTemplates:
    - metadata: { name: www }
      spec:
        accessModes: [ReadWriteOnce]
        resources: { requests: { storage: 1Gi } }`,
    tip: 'Each Pod gets its own PVC (www-web-0, www-web-1…). PVCs survive Pod restarts.',
  },
  {
    id: 'daemonset',
    name: 'DaemonSet',
    icon: '🛰️',
    category: 'workload',
    scope: 'namespace',
    oneliner: 'Runs one Pod per node',
    description:
      'Ensures one Pod runs on every node (or every node matching a selector). For node-level agents: logs, monitoring, CNI.',
    keyFields: [
      { name: 'spec.selector', desc: 'Pod selector' },
      { name: 'spec.template', desc: 'Pod template' },
      { name: 'spec.updateStrategy', desc: 'RollingUpdate / OnDelete' },
      { name: 'template.spec.tolerations', desc: 'Run on tainted nodes' },
    ],
    references: [{ name: 'Pod', via: 'spec.template' }],
    referencedBy: [],
    example: `apiVersion: apps/v1
kind: DaemonSet
metadata: { name: fluentd }
spec:
  selector: { matchLabels: { app: fluentd } }
  template:
    metadata: { labels: { app: fluentd } }
    spec:
      containers: [{ name: fluentd, image: fluent/fluentd:v1.16 }]`,
    tip: 'No "replicas" field — count is determined by nodes. Add tolerations to run on control-plane.',
  },
  {
    id: 'job',
    name: 'Job',
    icon: '⚡',
    category: 'workload',
    scope: 'namespace',
    oneliner: 'Run-once task that completes',
    description:
      'Runs Pods until a specified number of completions succeed. For batch tasks, migrations, one-offs.',
    keyFields: [
      { name: 'spec.completions', desc: 'How many successful runs needed' },
      { name: 'spec.parallelism', desc: 'How many to run in parallel' },
      { name: 'spec.backoffLimit', desc: 'Max retries before failed' },
      { name: 'restartPolicy', desc: 'Never or OnFailure' },
    ],
    references: [{ name: 'Pod', via: 'spec.template' }],
    referencedBy: [{ name: 'CronJob', via: 'jobTemplate creates Jobs' }],
    example: `apiVersion: batch/v1
kind: Job
metadata: { name: echo-date }
spec:
  template:
    spec:
      containers:
        - name: hello
          image: busybox
          command: [sh, -c, "date && echo Hello"]
      restartPolicy: Never
  backoffLimit: 4`,
    tip: 'Use restartPolicy: Never (or OnFailure) — Job semantics need controllable retries via backoffLimit.',
  },
  {
    id: 'cronjob',
    name: 'CronJob',
    icon: '🕐',
    category: 'workload',
    scope: 'namespace',
    oneliner: 'Scheduled Job (Unix cron syntax)',
    description:
      'Creates Jobs on a cron schedule. For periodic tasks: nightly backups, reports, cleanup.',
    keyFields: [
      { name: 'spec.schedule', desc: 'Cron expression' },
      { name: 'spec.concurrencyPolicy', desc: 'Allow / Forbid / Replace' },
      { name: 'spec.jobTemplate', desc: 'The Job to create per tick' },
    ],
    references: [{ name: 'Job', via: 'creates Jobs on schedule' }],
    referencedBy: [],
    example: `apiVersion: batch/v1
kind: CronJob
metadata: { name: nightly-backup }
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers: [{ name: backup, image: backup-tool:1.0 }]
          restartPolicy: OnFailure`,
    tip: 'Times are UTC by default. Use spec.timeZone (k8s 1.27+) for a custom timezone.',
  },
  {
    id: 'service',
    name: 'Service',
    icon: '🌐',
    category: 'network',
    scope: 'namespace',
    oneliner: 'Stable address for a group of Pods',
    description:
      'Provides a stable DNS name + IP in front of label-selected Pods. Load-balances. Types: ClusterIP, NodePort, LoadBalancer, ExternalName.',
    keyFields: [
      { name: 'spec.type', desc: 'ClusterIP / NodePort / LoadBalancer / ExternalName' },
      { name: 'spec.selector', desc: 'Label match for target Pods' },
      { name: 'spec.ports[].port', desc: 'Service port (the door)' },
      { name: 'spec.ports[].targetPort', desc: 'Container port (the destination)' },
    ],
    references: [{ name: 'Pod', via: 'spec.selector matches Pod labels' }],
    referencedBy: [
      { name: 'Ingress', via: 'rules[].http.paths[].backend.service.name' },
      { name: 'HTTPRoute', via: 'rules[].backendRefs[].name' },
      { name: 'StatefulSet', via: 'spec.serviceName (headless)' },
    ],
    example: `apiVersion: v1
kind: Service
metadata: { name: nginx-clusterip }
spec:
  type: ClusterIP
  selector: { app: nginx }
  ports: [{ port: 80, targetPort: 80 }]`,
    tip: 'ClusterIP for internal, NodePort exposes a node port, LoadBalancer provisions a cloud LB.',
  },
  {
    id: 'ingress',
    name: 'Ingress',
    icon: '🚦',
    category: 'network',
    scope: 'namespace',
    oneliner: 'HTTP/HTTPS routing rules (older API)',
    description:
      'Declares host/path → Service routing rules. Implemented by an Ingress controller. Often extended via vendor annotations.',
    keyFields: [
      { name: 'spec.ingressClassName', desc: 'Which controller' },
      { name: 'spec.rules[].host', desc: 'Hostname' },
      { name: 'spec.rules[].http.paths', desc: 'Path → Service' },
      { name: 'spec.tls', desc: 'TLS cert + hosts' },
    ],
    references: [
      { name: 'IngressClass', via: 'spec.ingressClassName' },
      { name: 'Service', via: 'paths[].backend.service.name' },
      { name: 'Secret', via: 'spec.tls[].secretName' },
    ],
    referencedBy: [],
    example: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: minimal-nginx }
spec:
  ingressClassName: nginx
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nginx-clusterip
                port: { number: 80 }`,
    tip: 'Ingress is in maintenance mode — Gateway API is the long-term replacement. Both are production-fine.',
  },
  {
    id: 'gateway',
    name: 'Gateway',
    icon: '🚪',
    category: 'network',
    scope: 'namespace',
    oneliner: 'The entry point listener (Gateway API)',
    description:
      'The listener / load balancer in the Gateway API. Owned by platform team. Picks implementation via gatewayClassName.',
    keyFields: [
      { name: 'spec.gatewayClassName', desc: 'Picks the implementation' },
      { name: 'spec.listeners', desc: 'Ports + protocols + TLS' },
    ],
    references: [
      { name: 'GatewayClass', via: 'spec.gatewayClassName' },
      { name: 'Secret', via: 'listeners[].tls (certs)' },
    ],
    referencedBy: [{ name: 'HTTPRoute', via: 'spec.parentRefs[].name' }],
    example: `apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata: { name: my-gateway }
spec:
  gatewayClassName: gke-l7-global-external-managed
  listeners:
    - { name: http, protocol: HTTP, port: 80 }`,
    tip: 'On GKE you only write Gateway + HTTPRoute — GatewayClass is pre-installed.',
  },
  {
    id: 'httproute',
    name: 'HTTPRoute',
    icon: '🛤️',
    category: 'network',
    scope: 'namespace',
    oneliner: 'Host/path → Service routing for a Gateway',
    description:
      'Routing rules attached to a Gateway. Owned by app teams. Native traffic splitting, header matching, rewrites.',
    keyFields: [
      { name: 'spec.parentRefs', desc: 'Which Gateway(s) this attaches to' },
      { name: 'spec.hostnames', desc: 'Which hostnames it serves' },
      { name: 'spec.rules[].matches', desc: 'Path/header/method matching' },
      { name: 'spec.rules[].backendRefs[].weight', desc: 'Traffic split (canary)' },
    ],
    references: [
      { name: 'Gateway', via: 'spec.parentRefs[].name' },
      { name: 'Service', via: 'spec.rules[].backendRefs[].name' },
    ],
    referencedBy: [],
    example: `apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata: { name: my-route }
spec:
  parentRefs: [{ name: my-gateway }]
  hostnames: ["example.com"]
  rules:
    - matches: [{ path: { type: PathPrefix, value: / } }]
      backendRefs:
        - { name: nginx-clusterip, port: 80, weight: 90 }
        - { name: nginx-v2,        port: 80, weight: 10 }`,
    tip: 'Traffic splitting via weights is built-in — no second Ingress object needed for canary.',
  },
  {
    id: 'configmap',
    name: 'ConfigMap',
    icon: '📋',
    category: 'config',
    scope: 'namespace',
    oneliner: 'Non-secret key-value configuration',
    description:
      'Holds configuration as key-value pairs or files. Consumed by Pods as env vars or mounted files.',
    keyFields: [
      { name: 'data', desc: 'Key-value pairs (UTF-8)' },
      { name: 'binaryData', desc: 'Binary data (base64)' },
    ],
    references: [],
    referencedBy: [
      { name: 'Pod', via: 'envFrom.configMapRef OR volumes.configMap.name' },
    ],
    example: `apiVersion: v1
kind: ConfigMap
metadata: { name: app-config }
data:
  LOG_LEVEL: "info"
  database.url: "postgres://db:5432/app"`,
    tip: 'NOT for secrets — values are plaintext. Use Secret for passwords, tokens, certs.',
  },
  {
    id: 'secret',
    name: 'Secret',
    icon: '🔐',
    category: 'config',
    scope: 'namespace',
    oneliner: 'Sensitive key-value data (base64)',
    description:
      'Like ConfigMap but base64-encoded. For passwords, tokens, TLS certs, image-pull credentials.',
    keyFields: [
      { name: 'type', desc: 'Opaque / kubernetes.io/tls / kubernetes.io/dockerconfigjson' },
      { name: 'data', desc: 'Base64-encoded key-value pairs' },
      { name: 'stringData', desc: 'Plain strings (auto-base64ed)' },
    ],
    references: [],
    referencedBy: [
      { name: 'Pod', via: 'envFrom.secretRef OR volumes.secret.secretName' },
      { name: 'Ingress', via: 'spec.tls[].secretName' },
      { name: 'Gateway', via: 'listeners[].tls.certificateRefs[].name' },
    ],
    example: `apiVersion: v1
kind: Secret
metadata: { name: db-creds }
type: Opaque
stringData:
  username: admin
  password: s3cret`,
    tip: 'Base64 is encoding, NOT encryption. Use cloud secret managers + External Secrets Operator for real production.',
  },
  {
    id: 'pvc',
    name: 'PersistentVolumeClaim',
    icon: '📥',
    category: 'storage',
    scope: 'namespace',
    oneliner: "An app's request for storage",
    description:
      'The "order form" for storage. Binds to an existing PV (static) or triggers a StorageClass to create one (dynamic).',
    keyFields: [
      { name: 'spec.accessModes', desc: 'RWO / ROX / RWX / RWOP' },
      { name: 'spec.resources.requests.storage', desc: 'Minimum size' },
      { name: 'spec.storageClassName', desc: 'Which StorageClass' },
      { name: 'spec.selector', desc: 'Label match for a specific PV' },
    ],
    references: [
      { name: 'PersistentVolume', via: 'binds to one' },
      { name: 'StorageClass', via: 'spec.storageClassName' },
    ],
    referencedBy: [
      { name: 'Pod', via: 'volumes.persistentVolumeClaim.claimName' },
      { name: 'StatefulSet', via: 'auto-created via volumeClaimTemplates' },
    ],
    example: `apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: my-pvc }
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: standard
  resources: { requests: { storage: 10Gi } }`,
    tip: 'The PVC is what your app references; the PV is the actual disk. With dynamic provisioning you only write the PVC.',
  },
  {
    id: 'serviceaccount',
    name: 'ServiceAccount',
    icon: '👤',
    category: 'identity',
    scope: 'namespace',
    oneliner: 'Identity for Pods (RBAC + cloud IAM)',
    description:
      'Pod identity for the K8s API. Annotated to tie to cloud IAM (IRSA on EKS, Workload Identity on GKE).',
    keyFields: [
      { name: 'metadata.name', desc: 'The SA identity' },
      { name: 'metadata.annotations', desc: 'IAM bindings' },
    ],
    references: [],
    referencedBy: [
      { name: 'Pod', via: 'spec.serviceAccountName' },
      { name: 'RoleBinding', via: 'subjects[].name' },
      { name: 'ClusterRoleBinding', via: 'subjects[].name' },
    ],
    example: `apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::1234:role/my-app`,
    tip: 'EKS IRSA + GKE Workload Identity are HUGE interview topics — Pods get cloud permissions without keys.',
  },
  {
    id: 'role',
    name: 'Role',
    icon: '🎫',
    category: 'identity',
    scope: 'namespace',
    oneliner: 'Namespace-scoped permission set',
    description:
      'A set of API permissions scoped to one namespace. Bound to subjects via RoleBinding.',
    keyFields: [
      { name: 'rules[].apiGroups', desc: 'Which API groups' },
      { name: 'rules[].resources', desc: 'Which resources' },
      { name: 'rules[].verbs', desc: 'get/list/watch/create/update/patch/delete' },
    ],
    references: [],
    referencedBy: [{ name: 'RoleBinding', via: 'roleRef.name' }],
    example: `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: my-app
  name: pod-reader
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]`,
    tip: 'Principle of least privilege — keep permissions tight to one namespace.',
  },
  {
    id: 'rolebinding',
    name: 'RoleBinding',
    icon: '🤝',
    category: 'identity',
    scope: 'namespace',
    oneliner: 'Grants a Role to subjects (in a namespace)',
    description:
      'Binds a Role (or a ClusterRole, scoped to one namespace) to users / groups / ServiceAccounts.',
    keyFields: [
      { name: 'subjects', desc: 'Who gets the perms' },
      { name: 'roleRef', desc: 'Which Role (or ClusterRole)' },
    ],
    references: [
      { name: 'Role', via: 'roleRef' },
      { name: 'ServiceAccount', via: 'subjects[]' },
    ],
    referencedBy: [],
    example: `apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: my-app
  name: read-pods
subjects:
  - kind: ServiceAccount
    name: my-app-sa
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io`,
    tip: 'Can reference a ClusterRole — reuse a common role but limit to one namespace.',
  },
];

const byId = new Map(resources.map((r) => [r.id, r]));
const byName = new Map(resources.map((r) => [r.name, r]));

export function findResourceById(id: string): Resource | undefined {
  return byId.get(id);
}

export function findResourceByName(name: string): Resource | undefined {
  return byName.get(name);
}
