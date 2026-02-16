export default async function handler(req, res) {
  try {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error("Missing GITHUB_TOKEN");
    }

    const query = `
    {
      user(login: "CodeWithKashvi") {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }`;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (!result.data || !result.data.user) {
      throw new Error("GitHub API returned invalid data");
    }

    const days = result.data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap(week => week.contributionDays);

    if (!days || days.length === 0) {
      throw new Error("No contribution data");
    }

    const max = Math.max(...days.map(d => d.contributionCount), 1);

    const width = 700;
    const height = 200;
    const step = width / days.length;

    let path = "";

    days.forEach((day, i) => {
      const x = i * step;
      const y = height - (day.contributionCount / max) * height;

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        const prev = days[i - 1];
        if (!prev) return;

        const prevX = (i - 1) * step;
        const prevY = height - (prev.contributionCount / max) * height;

        const midX = (prevX + x) / 2;
        const midY = (prevY + y) / 2;

        path += ` Q ${prevX} ${prevY}, ${midX} ${midY}`;
      }
    });

    const svg = `
    <svg width="800" height="250" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
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
        stroke-width="4"
        stroke-linecap="round"
        filter="url(#glow)"/>

      <circle r="6" fill="#7B1FA2" filter="url(#glow)">
        <animateMotion dur="14s" repeatCount="indefinite">
          <mpath href="#graph"/>
        </animateMotion>
      </circle>
    </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);

  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
}
