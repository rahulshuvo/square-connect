/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, Video, VideoOff, PhoneCall } from 'lucide-react'
import socket from '@/socket'

export default function VideoChat({ room }) {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const [peerConnection, setPeerConnection] = useState(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [localStream, setLocalStream] = useState(null)

  useEffect(() => {
    // Create RTCPeerConnection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Use Google's public STUN server
      ],
    })
    setPeerConnection(pc)

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate, room: room })
      }
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0]
    }

    // Listen for signaling events
    socket.on('offer', async ({ sdp }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('answer', { sdp: pc.localDescription, room: room })
    })

    socket.on('answer', async ({ sdp }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    })

    socket.on('ice-candidate', ({ candidate }) => {
      if (candidate) pc.addIceCandidate(new RTCIceCandidate(candidate))
    })

    // Cleanup on unmount
    return () => {
      //pc.close();
      //socket.disconnect();
    }
  }, [room])

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    localVideoRef.current.srcObject = stream
    setLocalStream(stream)

    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream))

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    socket.emit('offer', { sdp: peerConnection.localDescription, room: room })
    setIsAudioEnabled(true)
    setIsVideoEnabled(true)
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setIsAudioEnabled(audioTrack.enabled)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoEnabled(videoTrack.enabled)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">Video Chat</h2>
        <div className="flex gap-4 mb-4">
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-[300px] rounded-lg border border-gray-300 bg-black"
            />
            <div className="absolute bottom-2 left-2">
              <span className="bg-gray-900/75 text-white px-2 py-1 rounded-md text-sm">
                You
              </span>
            </div>
          </div>
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-[300px] rounded-lg border border-gray-300 bg-black"
            />
            <div className="absolute bottom-2 left-2">
              <span className="bg-gray-900/75 text-white px-2 py-1 rounded-md text-sm">
                Remote
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => startCall()}
            aria-label="Start call"
          >
            <PhoneCall className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleAudio()}
            aria-label={
              isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'
            }
          >
            {isAudioEnabled ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleVideo()}
            aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
