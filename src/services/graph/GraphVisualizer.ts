/**
 * V135: GraphVisualizer — ASCII + SVG dual rendering engine
 */

export interface RenderNode {
  id: string;
  influence: number;
}

export interface RenderEdge {
  from: string;
  to: string;
  weight: number;
}

/** Simple ASCII art for small graphs (< 20 nodes) */
export function renderAscii(nodes: RenderNode[], edges: RenderEdge[]): string {
  if (nodes.length === 0) return '(empty graph)';
  const nodeMap = new Map(nodes.map((n, i) => [n.id, i]));
  const lines: string[] = [];
  lines.push('Skill Graph (ASCII)');
  lines.push('─'.repeat(40));
  for (const [from, to, weight] of edges.map(e => [e.from, e.to, e.weight] as [string, string, number])) {
    const fi = nodeMap.get(from) ?? '?';
    const ti = nodeMap.get(to) ?? '?';
    lines.push(`  ${fi} ─${weight >= 0.5 ? '═' : '─'}→ ${ti}  [${(weight * 100).toFixed(0)}%]`);
  }
  lines.push('─'.repeat(40));
  lines.push('Nodes: ' + nodes.map(n => `${n.id}(${n.influence})`).join(', '));
  return lines.join('\n');
}

/** SVG rendering for larger graphs */
export function renderSvg(nodes: RenderNode[], edges: RenderEdge[]): string {
  if (nodes.length === 0) return '<svg viewBox="0 0 400 300"><text x="180" y="150" fill="#666">No data</text></svg>';
  const W = 400, H = 300, CX = W / 2, CY = H / 2, R = 120;
  const angleStep = (2 * Math.PI) / Math.max(nodes.length, 1);
  const positions = nodes.map((n, i) => ({
    id: n.id,
    x: CX + R * Math.cos(i * angleStep - Math.PI / 2),
    y: CY + R * Math.sin(i * angleStep - Math.PI / 2),
    influence: n.influence,
  }));
  const nodeMap = new Map(positions.map(p => [p.id, p]));

  const edgeLines = edges
    .filter(e => nodeMap.has(e.from) && nodeMap.has(e.to))
    .map(e => {
      const fp = nodeMap.get(e.from)!;
      const tp = nodeMap.get(e.to)!;
      return `<line x1="${fp.x}" y1="${fp.y}" x2="${tp.x}" y2="${tp.y}" stroke="#9ca" stroke-width="${e.weight * 2}" opacity="0.6" />`;
    })
    .join('\n  ');

  const nodeCircles = positions
    .map(p => {
      const r = 8 + p.influence * 12;
      return `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="#4a9" opacity="0.8" />` +
        `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="8" fill="#fff">${p.id.slice(0, 8)}</text>`;
    })
    .join('\n  ');

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${edgeLines}
  ${nodeCircles}
</svg>`;
}