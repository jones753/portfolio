import { pickGithubHighlights } from "../services/githubService.js"

export async function getGithubHighlights(req, res) {
  try {
    const username = String(req.query.username || "").trim()
    if (!username) {
      res.status(400).json({ error: "Missing username" })
      return
    }

    const githubRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`,
      {
        headers: {
          accept: "application/vnd.github+json",
          "user-agent": "web-portfolio",
        },
      },
    )

    if (!githubRes.ok) {
      res.status(502).json({ error: `GitHub API error (${githubRes.status})` })
      return
    }

    const events = await githubRes.json()
    const highlights = pickGithubHighlights(Array.isArray(events) ? events : [])
    res.json({ username, highlights })
  } catch (_error) {
    res.status(500).json({ error: "Unexpected server error" })
  }
}
