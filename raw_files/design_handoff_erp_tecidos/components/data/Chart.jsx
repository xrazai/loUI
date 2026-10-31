import React, { useState, useEffect, useRef, useMemo } from "react";

export function Chart({ type = "bar", data = [], height = 200, format = (v) => v, color = "var(--accent)", highlight = {}, style }) {
  const ref = useRef(null);
  const [w, setW] = useState(0), [hi, setHi] = useState(null);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(120, e.contentRect.width)));
    ro.observe(ref.current); return () => ro.disconnect();
  }, []);
  const padL = 44, padB = 22, padT = 8, iw = w - padL, ih = height - padB - padT;
  const maxV = Math.max(1, ...data.map((d) => d.value));
  const mag = Math.pow(10, Math.floor(Math.log10(maxV)));
  const top = Math.ceil(maxV / mag) * mag;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * top);
  const y = (v) => padT + ih - (v / top) * ih;
  const bw = iw / Math.max(1, data.length);
  const x = (i) => padL + bw * i + bw / 2;
  const pts = data.map((d, i) => [x(i), y(d.value)]);
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = pts.length ? path + ` L${pts[pts.length - 1][0]} ${padT + ih} L${pts[0][0]} ${padT + ih} Z` : "";
  const skip = Math.ceil(data.length / Math.max(1, Math.floor(iw / 44)));
  return (
    <div ref={ref} style={{ position: "relative", width: "100%", minWidth: 0, height, ...style }} onMouseLeave={() => setHi(null)}>
      {w > 0 && <svg width={w} height={height} style={{ display: "block", overflow: "visible" }}>
        {ticks.map((t) => <g key={t}>
          <line x1={padL} x2={w} y1={y(t)} y2={y(t)} stroke="var(--line-subtle)" strokeDasharray={t ? "2 3" : "0"} />
          <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" style={{ font: "400 var(--fs-caption) var(--font-mono)", fill: "var(--text-3)" }}>{format(t)}</text>
        </g>)}
        {type === "bar" && data.map((d, i) => {
          const bh = Math.max(1, padT + ih - y(d.value)), bwi = Math.min(28, bw * 0.6);
          return <rect key={i} x={x(i) - bwi / 2} y={y(d.value)} width={bwi} height={bh} rx="3" fill={hi === i ? color : highlight[i] || "var(--line-strong)"} style={{ transition: "fill var(--duration) var(--ease)" }} />;
        })}
        {type === "line" && <>
          <path d={area} fill={color} opacity="0.08" />
          <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          {hi != null && pts[hi] && <><line x1={pts[hi][0]} x2={pts[hi][0]} y1={padT} y2={padT + ih} stroke="var(--line-strong)" /><circle cx={pts[hi][0]} cy={pts[hi][1]} r="3.5" fill="var(--bg)" stroke={color} strokeWidth="1.5" /></>}
        </>}
        {data.map((d, i) => <g key={"l" + i}>
          {i % skip === 0 && <text x={x(i)} y={height - 6} textAnchor="middle" style={{ font: "400 var(--fs-caption) var(--font-mono)", fill: hi === i ? "var(--text)" : "var(--text-3)" }}>{d.label}</text>}
          <rect x={padL + bw * i} y={padT} width={bw} height={ih} fill="transparent" onMouseEnter={() => setHi(i)} />
        </g>)}
      </svg>}
      {w > 0 && hi != null && data[hi] && <div style={{ position: "absolute", left: Math.min(w - 90, Math.max(padL, x(hi) - 45)), top: Math.max(0, y(data[hi].value) - 40), pointerEvents: "none",
        padding: "4px 8px", background: "var(--primary-bg)", color: "var(--primary-fg)", borderRadius: "var(--radius-sm)", font: "500 var(--fs-label)/var(--lh-label) var(--font-sans)", whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: "var(--font-mono)" }}>{format(data[hi].value)}</span> <span style={{ color: "var(--primary-fg-muted)" }}>· {data[hi].label}</span>
      </div>}
    </div>
  );
}
