import {
  getRecentlyPlayedQuery,
  getSpotifyAccessToken,
  getSpotifyMissingConfigResponse,
  getTopTracksQuery,
  normalizeNowPlayingPayload,
  normalizeRecentlyPlayedPayload,
  normalizeTopTracksPayload,
} from "../services/spotifyService.js"

export async function getNowPlaying(_req, res) {
  try {
    const token = await getSpotifyAccessToken()
    if (!token?.access_token) {
      res.status(200).json(getSpotifyMissingConfigResponse())
      return
    }

    const spotifyRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { authorization: `Bearer ${token.access_token}` },
    })

    if (spotifyRes.status === 204) {
      res.status(200).json({ configured: true, isPlaying: false })
      return
    }

    if (!spotifyRes.ok) {
      res.status(502).json({ configured: true, error: `Spotify API error (${spotifyRes.status})` })
      return
    }

    const data = await spotifyRes.json()
    res.status(200).json(normalizeNowPlayingPayload(data))
  } catch (_error) {
    res.status(500).json({ error: "Unexpected server error" })
  }
}

export async function getTopTracks(req, res) {
  try {
    const token = await getSpotifyAccessToken()
    if (!token?.access_token) {
      res.status(200).json(getSpotifyMissingConfigResponse())
      return
    }

    const { limit, safeTimeRange } = getTopTracksQuery(req.query)
    const spotifyRes = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=${encodeURIComponent(safeTimeRange)}`,
      {
        headers: { authorization: `Bearer ${token.access_token}` },
      },
    )

    if (spotifyRes.status === 401 || spotifyRes.status === 403) {
      res.status(200).json({
        configured: true,
        error: "Missing Spotify scopes. Recreate your refresh token with user-top-read.",
      })
      return
    }

    if (!spotifyRes.ok) {
      res.status(502).json({ configured: true, error: `Spotify API error (${spotifyRes.status})` })
      return
    }

    const data = await spotifyRes.json()
    res.status(200).json(normalizeTopTracksPayload(data, safeTimeRange))
  } catch (_error) {
    res.status(500).json({ error: "Unexpected server error" })
  }
}

export async function getRecentlyPlayed(req, res) {
  try {
    const token = await getSpotifyAccessToken()
    if (!token?.access_token) {
      res.status(200).json(getSpotifyMissingConfigResponse())
      return
    }

    const { limit } = getRecentlyPlayedQuery(req.query)
    const spotifyRes = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
      headers: { authorization: `Bearer ${token.access_token}` },
    })

    if (spotifyRes.status === 401 || spotifyRes.status === 403) {
      res.status(200).json({
        configured: true,
        error: "Missing Spotify scopes. Recreate your refresh token with user-read-recently-played.",
      })
      return
    }

    if (!spotifyRes.ok) {
      res.status(502).json({ configured: true, error: `Spotify API error (${spotifyRes.status})` })
      return
    }

    const data = await spotifyRes.json()
    res.status(200).json(normalizeRecentlyPlayedPayload(data))
  } catch (_error) {
    res.status(500).json({ error: "Unexpected server error" })
  }
}
