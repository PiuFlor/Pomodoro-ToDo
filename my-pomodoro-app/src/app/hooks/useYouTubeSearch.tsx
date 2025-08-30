// app/hooks/useYouTubeSearch.ts
import { useState } from 'react'
import type { Track } from './useMusicPlayer'

export function useYouTubeSearch() {
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

  const searchTracks = async (query: string) => {
    if (!query.trim() || !API_KEY) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
          query
        )}&type=video&videoCategoryId=10&key=${API_KEY}`
      )

      const data = await response.json()

      // ✅ Validación agregada
      if (!data.items || !Array.isArray(data.items)) {
        setSearchResults([])
        return
      }

      const tracks = await Promise.all(
        data.items.map(async (item: any) => {
          const duration = await getVideoDuration(item.id.videoId)
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high.url,
            duration,
            url: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`,
          }
        })
      )
      setSearchResults(tracks)
    } catch (error) {
      console.error('Error searching YouTube:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const getVideoDuration = async (videoId: string): Promise<string> => {
    if (!API_KEY) return 'N/A'
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${API_KEY}`
      )
      const data = await response.json()
      
      // ✅ Validación agregada
      if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        return 'N/A'
      }
      
      const iso = data.items[0].contentDetails.duration
      return convertISO8601ToTime(iso)
    } catch (err) {
      console.warn('Could not fetch duration for', videoId, err)
      return 'N/A'
    }
  }

  const convertISO8601ToTime = (iso: string): string => {
    try {
      const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (!match) return '0:00'
      
      const h = parseInt(match[1] || '0', 10)
      const m = parseInt(match[2] || '0', 10)
      const s = parseInt(match[3] || '0', 10)
      const totalMinutes = h * 60 + m
      return `${totalMinutes}:${s.toString().padStart(2, '0')}`
    } catch (error) {
      console.warn('Error converting duration:', iso, error)
      return '0:00'
    }
  }

  const getPopularTracks = async () => {
    if (!API_KEY) {
      console.warn('YouTube API key not found')
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&maxResults=6&videoCategoryId=10&regionCode=US&key=${API_KEY}`
      )
      
      // ✅ Verificar si la respuesta es OK
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()

      // ✅ DEBUG: Ver qué responde la API
      console.log('YouTube API Response:', data)

      // ✅ Validación robusta
      if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        console.warn('No items found in YouTube API response')
        setSearchResults([])
        return
      }

      const tracks = await Promise.all(
        data.items.map(async (item: any) => ({
          id: item.id,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
          duration: convertISO8601ToTime(item.contentDetails.duration),
          url: `https://www.youtube.com/embed/${item.id}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`,
        }))
      )
      setSearchResults(tracks)
    } catch (error) {
      console.error('Error fetching popular tracks:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const getFocusTracks = async () => {
    await searchTracks('lofi hip hop mix focus study ambient')
  }

  return {
    searchResults,
    isLoading,
    searchTracks,
    getPopularTracks,
    getFocusTracks,
  }
}