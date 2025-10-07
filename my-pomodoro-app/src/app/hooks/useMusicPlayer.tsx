// app/hooks/useMusicPlayer.ts
import { useState, useEffect, useRef, useCallback } from 'react'

export interface Track {
  id: string
  title: string
  artist: string
  thumbnail: string
  duration: string
  url: string
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT: any
  }
}

export function useMusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)

  // Cargar YouTube IFrame API
  useEffect(() => {
    if (!window.YT && !isInitializedRef.current) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      if (firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      }

      window.onYouTubeIframeAPIReady = () => {
        isInitializedRef.current = true
        if (currentTrack && containerRef.current && !playerRef.current) {
          createPlayer()
        }
      }
    } else if (currentTrack && containerRef.current && !playerRef.current) {
      isInitializedRef.current = true
      createPlayer()
    }

    return () => {
      // No destruir el player completamente, solo pausar
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo()
      }
    }
  }, [currentTrack])

  const createPlayer = useCallback(() => {
    if (!containerRef.current || playerRef.current || !currentTrack) return

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: currentTrack.id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          loop: 1,
          playlist: currentTrack.id,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(volume * 100)
            setIsPlaying(true)
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false)
            } else if (e.data === window.YT.PlayerState.ENDED) {
              // Reiniciar video cuando termine
              e.target.playVideo()
            }
          },
          onError: (e: any) => {
            console.error('YouTube Player Error:', e)
          }
        },
      })
    } catch (error) {
      console.error('Error creating YouTube player:', error)
    }
  }, [currentTrack, volume])

  const playTrack = useCallback((track: Track) => {
    // Si es el mismo track, solo continuar reproducción
    if (currentTrack?.id === track.id && playerRef.current) {
      playerRef.current.playVideo()
      return
    }

    // Si hay un player existente, destruirlo primero
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy()
      } catch (error) {
        console.warn('Error destroying previous player:', error)
      }
      playerRef.current = null
    }

    setCurrentTrack(track)
  }, [currentTrack])

  const togglePlayPause = useCallback(() => {
    if (playerRef.current) {
      try {
        if (isPlaying) {
          playerRef.current.pauseVideo()
        } else {
          playerRef.current.playVideo()
        }
      } catch (error) {
        console.error('Error toggling play/pause:', error)
      }
    }
  }, [isPlaying])

  const setVolumeLocal = useCallback((vol: number) => {
    const volumeValue = Math.max(0, Math.min(100, Math.round(vol * 100)))
    setVolume(vol)

    if (window.YT && playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(volumeValue)
      } catch (error) {
        console.warn('No se pudo ajustar el volumen del reproductor de YouTube', error)
      }
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(time, true)
      } catch (error) {
        console.warn('Error seeking:', error)
      }
    }
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    currentTrack,
    isPlaying,
    volume,
    currentTime: 0,
    duration: 0,
    audioRef: containerRef,
    playTrack,
    togglePlayPause,
    setVolume: setVolumeLocal,
    seek,
    formatTime,
    playerRef // Exportar para acceso directo si es necesario
  }
}