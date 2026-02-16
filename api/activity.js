const months = [];
let lastMonth = "";

days.forEach((day, i) => {
  const month = new Date(day.date).toLocaleString("default", { month: "short" });
  if (month !== lastMonth) {
    months.push({ month, index: i });
    lastMonth = month;
  }
});

const monthLabels = months.map(m => {
  const x = (m.index * step);
  return `<text x="${x}" y="230" font-size="12" fill="#444">${m.month}</text>`;
}).join("");

const svg = `
<svg width="800" height="260" viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="white" rx="20"/>

  <path id="graph"
    d="${path}"
    fill="none"
    stroke="#00C853"
    stroke-width="3"
    filter="url(#glow)"/>

  ${monthLabels}

  <circle r="10" fill="#7B1FA2" filter="url(#glow)">
    <animateMotion dur="6s" repeatCount="indefinite">
      <mpath href="#graph"/>
    </animateMotion>
  </circle>

</svg>
`;
