// app/hooks/useMusicPlayer.ts
import { useState, useEffect, useRef } from 'react'

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
  const [volume, setVolume] = useState(0.5)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cargar YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        if (currentTrack && containerRef.current && !playerRef.current) {
          createPlayer()
        }
      }
    } else if (currentTrack && containerRef.current && !playerRef.current) {
      createPlayer()
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [currentTrack])

  const createPlayer = () => {
    if (!containerRef.current || playerRef.current || !currentTrack) return

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
          }
        },
      },
    })
  }

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
  }

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    }
  }

  const setVolumeLocal = (vol: number) => {
    setVolume(vol)
    if (playerRef.current) {
      playerRef.current.setVolume(vol * 100)
    }
  }

  const seek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
  }
}