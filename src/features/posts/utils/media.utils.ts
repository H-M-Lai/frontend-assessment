import { MediaType } from '../types/post.types'

/**
 * Utility to parse standard video URLs (YouTube, Vimeo, direct streams)
 * and convert them to standard embeddable resource formats.
 */
export function getEmbeddableVideoUrl(url: string | undefined | null) {
  if (!url) return null

  const trimmedUrl = url.trim()

  // 1. YouTube Matches (watch link, share link, mobile link, embeds)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i
  const ytMatch = trimmedUrl.match(ytRegex)
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube' as const,
      url: `https://www.youtube.com/embed/${ytMatch[1]}`,
      id: ytMatch[1],
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`,
    }
  }

  // 2. Vimeo Matches (standard link, channel links, players)
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i
  const vimeoMatch = trimmedUrl.match(vimeoRegex)
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo' as const,
      url: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      id: vimeoMatch[1],
    }
  }

  // 3. Direct Streams or Local uploads (Base64)
  const directVideoRegex = /\.(mp4|webm|ogg|mov)(?:\?.*)?$/i
  const isBase64Video = trimmedUrl.startsWith('data:video/')
  if (directVideoRegex.test(trimmedUrl) || isBase64Video) {
    return {
      type: 'direct' as const,
      url: trimmedUrl,
      id: null,
    }
  }

  return null
}

/**
 * Automatically detects whether a pasted URL or base64 stream is an Image or a Video.
 */
export function detectMediaType(url: string | undefined | null): MediaType {
  if (!url) return MediaType.IMAGE

  const trimmed = url.trim()

  // 1. Base64 local upload check
  if (trimmed.startsWith('data:')) {
    if (trimmed.startsWith('data:video/')) return MediaType.VIDEO
    return MediaType.IMAGE
  }

  // 2. Parsable video platform or extension check
  const embed = getEmbeddableVideoUrl(trimmed)
  if (embed) {
    return MediaType.VIDEO
  }

  // Default fallback is standard image
  return MediaType.IMAGE
}
