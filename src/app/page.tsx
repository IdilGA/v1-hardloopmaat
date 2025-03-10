"use client"

import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonStanding, Play, Pause, Volume2 } from "lucide-react"

export default function RunningPartnerApp() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [partnerPosition, setPartnerPosition] = useState(0) // -100 (far behind) to 100 (far ahead)
  const [volume, setVolume] = useState(70)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const pannerNodeRef = useRef<StereoPannerNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Initialize audio context and nodes
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()
      audioRef.current.src = "/running-sound.mp3" // Plaats je MP3-bestand in de public map
      audioRef.current.loop = true

      // AudioContext moet worden geïnitialiseerd na een gebruikersinteractie
      const handleUserInteraction = () => {
        if (!audioContextRef.current) {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext
          audioContextRef.current = new AudioContext()

          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current!)
          pannerNodeRef.current = audioContextRef.current.createStereoPanner()
          gainNodeRef.current = audioContextRef.current.createGain()

          // Connect nodes: source -> panner -> gain -> destination
          sourceNodeRef.current.connect(pannerNodeRef.current)
          pannerNodeRef.current.connect(gainNodeRef.current)
          gainNodeRef.current.connect(audioContextRef.current.destination)

          // Remove event listeners after initialization
          document.removeEventListener("click", handleUserInteraction)
          document.removeEventListener("touchstart", handleUserInteraction)
        }
      }

      document.addEventListener("click", handleUserInteraction)
      document.addEventListener("touchstart", handleUserInteraction)

      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }

        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }

        document.removeEventListener("click", handleUserInteraction)
        document.removeEventListener("touchstart", handleUserInteraction)
      }
    }
  }, [])

  // Update audio parameters when position or volume changes
  useEffect(() => {
    if (pannerNodeRef.current) {
      // Convert position (-100 to 100) to panning value (-1 to 1)
      const panValue = partnerPosition / 100
      pannerNodeRef.current.pan.value = panValue
    }

    if (gainNodeRef.current) {
      // Calculate distance-based volume attenuation
      // Further away = quieter (in both directions)
      const distance = Math.abs(partnerPosition) / 100
      const baseVolume = volume / 100
      const attenuatedVolume = baseVolume * (1 - distance * 0.7)
      gainNodeRef.current.gain.value = attenuatedVolume
    }
  }, [partnerPosition, volume])

  // Handle play/pause
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Virtuele Hardloopmaat</CardTitle>
          <CardDescription>
            Pas de positie van je virtuele hardloopmaat aan en luister via een koptelefoon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Ver achter</span>
              <PersonStanding className="h-6 w-6" />
              <span>Ver voor</span>
            </div>
            <Slider
              value={[partnerPosition]}
              min={-100}
              max={100}
              step={1}
              onValueChange={(value) => setPartnerPosition(value[0])}
              className="cursor-pointer"
            />
            <div className="text-center mt-2">
              {partnerPosition === 0 ? (
                <span>Naast je</span>
              ) : partnerPosition < 0 ? (
                <span>{Math.abs(partnerPosition)}% achter je</span>
              ) : (
                <span>{partnerPosition}% voor je</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span>Volume</span>
            </div>
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
              className="cursor-pointer"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={togglePlayback} className="w-full" variant="default">
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Pauzeren
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Starten
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

