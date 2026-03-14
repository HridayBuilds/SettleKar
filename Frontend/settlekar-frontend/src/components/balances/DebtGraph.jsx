import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/formatters';

const COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  edge: '#93c5fd',
  nodeBg: '#1e293b',
};

function computeLayout(nodes, width, height) {
  const cx = width / 2;
  const cy = height / 2;

  if (nodes.length === 1) {
    return [{ ...nodes[0], x: cx, y: cy }];
  }

  if (nodes.length === 2) {
    return [
      { ...nodes[0], x: cx - 160, y: cy },
      { ...nodes[1], x: cx + 160, y: cy },
    ];
  }

  const radius = Math.min(cx, cy) - 50;

  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    return {
      ...node,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

export function DebtGraph({ graph }) {
  if (!graph) return null;

  const { nodes = [], edges = [] } = graph;
  if (nodes.length === 0) return null;

  // Assign numbers to nodes
  const nodeNumberMap = {};
  nodes.forEach((n, i) => {
    nodeNumberMap[n.userId] = i + 1;
  });

  const nodeRadius = 22;
  const svgWidth = Math.max(440, nodes.length * 120);
  const svgHeight = Math.max(320, nodes.length * 80);

  const positioned = computeLayout(nodes, svgWidth, svgHeight);
  const nodeMap = {};
  positioned.forEach((n) => {
    nodeMap[n.userId] = n;
  });

  // Build a set of reverse edge keys to detect bidirectional pairs
  const edgeKeys = new Set();
  edges.forEach((e) => edgeKeys.add(`${e.fromUserId}->${e.toUserId}`));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Balance Graph
      </h3>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto w-full"
          style={{ minHeight: '260px', maxWidth: '560px' }}
        >
          <defs>
            <marker
              id="debt-arrow"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.edge} />
            </marker>
          </defs>

          {/* Edges - simple straight lines with offset for bidirectional */}
          {edges.map((edge, i) => {
            const from = nodeMap[edge.fromUserId];
            const to = nodeMap[edge.toUserId];
            if (!from || !to) return null;

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return null;

            const ux = dx / dist;
            const uy = dy / dist;

            // Check if there's also a reverse edge
            const hasReverse = edgeKeys.has(`${edge.toUserId}->${edge.fromUserId}`);

            // Perpendicular offset for bidirectional edges
            let offsetX = 0;
            let offsetY = 0;
            if (hasReverse) {
              const perpX = -uy;
              const perpY = ux;
              // One direction offsets left, the other right (use consistent ordering)
              const isFirst = String(edge.fromUserId) < String(edge.toUserId);
              const sign = isFirst ? 1 : -1;
              offsetX = perpX * 12 * sign;
              offsetY = perpY * 12 * sign;
            }

            const x1 = from.x + ux * (nodeRadius + 6) + offsetX;
            const y1 = from.y + uy * (nodeRadius + 6) + offsetY;
            const x2 = to.x - ux * (nodeRadius + 10) + offsetX;
            const y2 = to.y - uy * (nodeRadius + 10) + offsetY;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const amountText = formatCurrency(edge.amount);
            const textWidth = amountText.length * 7 + 14;

            return (
              <g key={`edge-${i}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={COLORS.edge}
                  strokeWidth="2"
                  markerEnd="url(#debt-arrow)"
                  opacity="0.8"
                />
                {/* Amount label */}
                <rect
                  x={midX - textWidth / 2}
                  y={midY - 10}
                  width={textWidth}
                  height="20"
                  rx="10"
                  fill="#0f172a"
                  stroke={COLORS.edge}
                  strokeWidth="1"
                  opacity="0.95"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="'DM Mono', monospace"
                  fontWeight="600"
                  fill={COLORS.edge}
                >
                  {amountText}
                </text>
              </g>
            );
          })}

          {/* Nodes - numbered circles */}
          {positioned.map((node) => {
            const num = nodeNumberMap[node.userId];
            const isPositive = node.netBalance >= 0;
            const isZero = node.netBalance === 0;
            const color = isZero ? '#64748b' : isPositive ? COLORS.positive : COLORS.negative;

            return (
              <g key={node.userId}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={COLORS.nodeBg}
                  stroke={color}
                  strokeWidth="3"
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="15"
                  fontFamily="'DM Sans', sans-serif"
                  fontWeight="bold"
                  fill="white"
                >
                  {num}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend: number to name mapping */}
      <div className="mt-4 space-y-1.5 rounded-lg bg-bg-elevated/50 px-4 py-3">
        {nodes.map((node, i) => {
          const isPositive = node.netBalance >= 0;
          const isZero = node.netBalance === 0;
          const color = isZero ? 'text-text-muted' : isPositive ? 'text-success' : 'text-danger';
          const name = node.name || '?';

          return (
            <div key={node.userId} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-card text-xs font-bold text-text-primary ring-1 ring-border">
                  {i + 1}
                </span>
                <span className="text-text-secondary">{name}</span>
              </div>
              <span className={`font-mono text-xs font-semibold ${color}`}>
                {isZero ? '₹0' : `${isPositive ? '+' : ''}${formatCurrency(node.netBalance)}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Color legend */}
      <div className="mt-3 flex items-center justify-center gap-5 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.positive }} />
          Gets back
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.negative }} />
          Owes
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="18" height="8" className="inline-block">
            <line x1="0" y1="4" x2="14" y2="4" stroke={COLORS.edge} strokeWidth="2" />
            <polygon points="12 1, 18 4, 12 7" fill={COLORS.edge} />
          </svg>
          Transaction
        </div>
      </div>
    </Card>
  );
}
