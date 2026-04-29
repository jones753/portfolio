export function getSpotifyMissingConfigResponse() {
  return {
    configured: false,
    message:
      "Spotify is not configured. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN.",
  }
}

function getSpotifyEnv() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  return { clientId, clientSecret, refreshToken }
}

export async function getSpotifyAccessToken() {
  const { clientId, clientSecret, refreshToken } = getSpotifyEnv()
  if (!clientId || !clientSecret || !refreshToken) return null

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${auth}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!tokenRes.ok) return null
  return tokenRes.json()
}

export function normalizeNowPlayingPayload(data) {
  const item = data?.item
  return {
    configured: true,
    isPlaying: Boolean(data?.is_playing),
    track: item?.name ?? null,
    artists: Array.isArray(item?.artists) ? item.artists.map((a) => a?.name).filter(Boolean) : [],
    album: item?.album?.name ?? null,
    url: item?.external_urls?.spotify ?? null,
    albumImage:
      Array.isArray(item?.album?.images) && item.album.images.length ? item.album.images[0]?.url ?? null : null,
  }
}

export function normalizeTopTracksPayload(data, timeRange) {
  const items = Array.isArray(data?.items) ? data.items : []
  return {
    configured: true,
    timeRange,
    items: items.map((track) => ({
      id: track?.id ?? null,
      track: track?.name ?? null,
      artists: Array.isArray(track?.artists) ? track.artists.map((a) => a?.name).filter(Boolean) : [],
      url: track?.external_urls?.spotify ?? null,
    })),
  }
}

export function normalizeRecentlyPlayedPayload(data) {
  const items = Array.isArray(data?.items) ? data.items : []
  return {
    configured: true,
    items: items.map((item) => {
      const track = item?.track
      return {
        id: track?.id ?? null,
        track: track?.name ?? null,
        artists: Array.isArray(track?.artists) ? track.artists.map((a) => a?.name).filter(Boolean) : [],
        url: track?.external_urls?.spotify ?? null,
        playedAt: item?.played_at ?? null,
      }
    }),
  }
}

export function getTopTracksQuery(query) {
  const limit = Math.max(1, Math.min(10, Number(query.limit ?? 5) || 5))
  const timeRange = String(query.time_range || "short_term")
  const allowedTimeRanges = new Set(["short_term", "medium_term", "long_term"])
  const safeTimeRange = allowedTimeRanges.has(timeRange) ? timeRange : "short_term"

  return { limit, safeTimeRange }
}

export function getRecentlyPlayedQuery(query) {
  const limit = Math.max(1, Math.min(10, Number(query.limit ?? 5) || 5))
  return { limit }
}
