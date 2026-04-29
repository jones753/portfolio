export function pickGithubHighlights(events) {
  const highlights = []

  for (const event of events) {
    if (event.type === "PushEvent") {
      const commits = event.payload?.commits ?? []
      const first = commits[0]
      const commitSha = first?.sha
      highlights.push({
        id: event.id,
        kind: "push",
        repo: event.repo?.name,
        title: first?.message ? `Pushed: ${first.message}` : "Pushed commits",
        url:
          event.repo?.name && commitSha
            ? `https://github.com/${event.repo.name}/commit/${commitSha}`
            : event.repo?.name
              ? `https://github.com/${event.repo.name}`
              : undefined,
        createdAt: event.created_at,
      })
      continue
    }

    if (event.type === "PullRequestEvent") {
      const pr = event.payload?.pull_request
      highlights.push({
        id: event.id,
        kind: "pull_request",
        repo: event.repo?.name,
        title: pr?.title ? `PR: ${pr.title}` : "Pull request activity",
        url: pr?.html_url,
        createdAt: event.created_at,
      })
      continue
    }

    if (event.type === "IssuesEvent") {
      const issue = event.payload?.issue
      highlights.push({
        id: event.id,
        kind: "issue",
        repo: event.repo?.name,
        title: issue?.title ? `Issue: ${issue.title}` : "Issue activity",
        url: issue?.html_url,
        createdAt: event.created_at,
      })
    }
  }

  return highlights.slice(0, 8)
}
