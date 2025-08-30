import { useState, useEffect } from 'react'
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Slider } from "@/app/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"
import { Badge } from "@/app/components/ui/badge"
import { Music, Play, Pause, Volume2, Search, Clock, Headphones, TrendingUp, Brain, ChevronUp, ChevronDown } from 'lucide-react'
import { useMusicPlayer } from '@/app/hooks/useMusicPlayer'
import { useYouTubeSearch } from '@/app/hooks/useYouTubeSearch'
import { motion, AnimatePresence } from 'framer-motion'
import type { Track } from '@/app/hooks/useMusicPlayer'

interface MusicPlayerProps {
  isTimerRunning?: boolean
  isAlarmActive?: boolean
  musicVolume: number
  setMusicVolume: (volume: number) => void
}

export default function MusicPlayer({
  isTimerRunning = false,
  isAlarmActive = false,
  musicVolume,
  setMusicVolume
}: MusicPlayerProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)

  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    audioRef,
    playTrack,
    togglePlayPause,
    setVolume: setPlayerVolume,
    seek,
    formatTime
  } = useMusicPlayer()

  const {
    searchResults,
    isLoading,
    searchTracks,
    getPopularTracks,
    getFocusTracks
  } = useYouTubeSearch()

  // Sincronizar volumen externo con el hook
  useEffect(() => {
    setPlayerVolume(musicVolume)
  }, [musicVolume, setPlayerVolume])

  const handleSearch = () => {
    searchTracks(searchInput)
  }

  const handleTrackSelect = (track: Track) => {
    playTrack(track)
    setIsSearchOpen(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Animación para el acordeón
  const accordionVariants = {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: { opacity: 1, height: 'auto', overflow: 'hidden' },
    exit: { opacity: 0, height: 0, overflow: 'hidden' }
  }

  return (
    <>
      {/* Reproductor de YouTube (oculto) */}
      <div
        ref={audioRef}
        style={{ width: '0', height: '0', visibility: 'hidden' }}
      ></div>

      {/* Título principal fuera del acordeón */}
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-700">
            <Music className="h-6 w-6" />
            Música de Enfoque
          </h2>
          <div className="transform transition-transform duration-200 group-hover:scale-105">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-indigo-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-indigo-500" />
            )}
          </div>
        </div>

        {/* Contenido desplegable */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={accordionVariants}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card 
                className={`shadow-xl border-0 backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                  isAlarmActive
                    ? 'animate-pulse bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 shadow-red-200/50'
                    : 'bg-gradient-to-br from-indigo-50 to-purple-50'
                }`}
              >
                <CardContent className="space-y-4 pt-4">
                  {/* Track actual */}
                  {currentTrack ? (
                    <div className="bg-white/80 p-4 rounded-xl shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={currentTrack.thumbnail} 
                          alt={currentTrack.title}
                          className="w-12 h-12 rounded-lg object-cover shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {currentTrack.title}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {currentTrack.artist}
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePlayPause()
                          }}
                          size="sm"
                          className={`rounded-full w-10 h-10 p-0 shadow-lg transition-all ${
                            isPlaying 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 ml-0.5" />
                          )}
                        </Button>
                      </div>

                      {/* Control de volumen */}
                      <div className="flex items-center gap-2 mt-3">
                        <Volume2 className="h-4 w-4 text-gray-600" />
                        <Slider
                          value={[musicVolume * 100]}
                          max={100}
                          step={1}
                          onValueChange={([value]) => setMusicVolume(value / 100)}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-600 w-8">
                          {Math.round(musicVolume * 100)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/60 p-6 rounded-xl text-center border-2 border-dashed border-indigo-200">
                      <Headphones className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
                      <p className="text-indigo-600 font-medium mb-2">
                        No hay música seleccionada
                      </p>
                      <p className="text-sm text-indigo-400">
                        Busca y selecciona música para concentrarte mejor
                      </p>
                    </div>
                  )}

                  {/* Botón para buscar música */}
                  <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Buscar Música
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
                          <Music className="h-5 w-5" />
                          Seleccionar Música de Enfoque
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                        {/* Barra de búsqueda */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Buscar música para concentrarse..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 rounded-xl border-2"
                          />
                          <Button 
                            onClick={handleSearch}
                            className="rounded-xl px-6"
                            disabled={isLoading}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Categorías rápidas */}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={getFocusTracks}
                            className="rounded-full text-xs"
                          >
                            <Brain className="h-3 w-3 mr-1" />
                            Enfoque
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={getPopularTracks}
                            className="rounded-full text-xs"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Popular
                          </Button>
                        </div>

                        {/* Resultados de búsqueda */}
                        <div className="flex-1 overflow-y-auto">
                          {isLoading ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                              <p className="text-gray-600">Buscando música...</p>
                            </div>
                          ) : searchResults.length > 0 ? (
                            <div className="space-y-2">
                              {searchResults.map((track) => (
                                <div
                                  key={track.id}
                                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all group border border-transparent hover:border-indigo-200"
                                  onClick={() => handleTrackSelect(track)}
                                >
                                  <img 
                                    src={track.thumbnail} 
                                    alt={track.title}
                                    className="w-16 h-16 rounded-lg object-cover shadow-sm"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 truncate group-hover:text-indigo-700">
                                      {track.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 truncate">
                                      {track.artist}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {track.duration}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="rounded-full opacity-0 group-hover:opacity-100 transition-all bg-indigo-600 hover:bg-indigo-700"
                                  >
                                    <Play className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 mb-2">
                                Busca música para concentrarte
                              </p>
                              <p className="text-sm text-gray-500">
                                Prueba términos como "lofi", "focus", "study" o "ambient"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Indicador de estado */}
                  {isTimerRunning && currentTrack && (
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">
                          Música activa durante el Pomodoro
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Notificación visual de alarma */}
                  {isAlarmActive && (
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 p-3 rounded-xl animate-pulse">
                      <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                        🔔 ¡Tiempo completado!
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}