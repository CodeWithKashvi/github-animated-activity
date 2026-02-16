export default async function handler(req, res) {
  try {
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

    if (!result.data) {
      throw new Error("GitHub API error");
    }

    const days = result.data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap(week => week.contributionDays);

    const max = Math.max(...days.map(d => d.contributionCount), 1);

    const width = 700;
    const height = 200;
    const step = width / days.length;

    let path = "";

    days.forEach((day, i) => {
      const x = i * step;
      const y = height - (day.contributionCount / max) * height;

      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    const svg = `
    <svg width="800" height="250" xmlns="http://www.w3.org/2000/svg">
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

      <circle r="10" fill="#7B1FA2" filter="url(#glow)">
        <animateMotion dur="6s" repeatCount="indefinite">
          <mpath href="#graph"/>
        </animateMotion>
      </circle>
    </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);

  } catch (error) {
    res.status(500).send("Server Error: " + error.message);
  }
}
