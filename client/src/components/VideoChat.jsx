import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, Video, VideoOff } from 'lucide-react'

export default function VideoChat() {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">Video Chat</h2>
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <span className="text-xl font-semibold text-gray-500">
            Video Feed
          </span>
        </div>
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMicOn(!isMicOn)}
            aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isMicOn ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsVideoOn(!isVideoOn)}
            aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? (
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
