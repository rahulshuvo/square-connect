/* eslint-disable react/prop-types */
import { useState } from "react"
// import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import socket from './socket'

export default function InitGame({ setRoom, setOrientation, setPlayers }) {
  // const router = useRouter()
  const [username, setUsername] = useState("")
  const [gameMode, setGameMode] = useState("start")
  const [pieceColor, setPieceColor] = useState("random")
  const [gameDuration, setGameDuration] = useState("10")
  const [roomId, setRoomId] = useState("")
  const [roomError, setRoomError] = useState('')
  const [roomDialogOpen, setRoomDialogOpen] = useState(false)
  
  const getRandomColor = () => {
    return Math.random() < 0.5 ? 'white' : 'black';
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send this data to your backend or state management
    // For now, we'll just log it and redirect to a placeholder game page
    console.log({ username, gameMode, pieceColor, gameDuration, roomId })

    const finalColor = pieceColor === 'random' ? getRandomColor() : pieceColor;


    socket.emit("username", username);
    socket.emit("setOrientation", finalColor );
    if (gameMode === "start") {
      // router.push(`/game?username=${username}&mode=${gameMode}&color=${pieceColor}&duration=${gameDuration}`)
      socket.emit('createRoom', (r) => {
        console.log(r)
        setRoom(r)
        setOrientation(finalColor)
      })
    } else {
      // router.push(`/game?username=${username}&mode=${gameMode}&roomId=${roomId}`)
      socket.emit("joinRoom", { roomId: roomId }, (r) => {
        console.log("joinRoom response:", r);
        // r is the response from the server
        if (r.error) return setRoomError(r.message); // if an error is returned in the response set roomError to the error message and exit
        setRoom(r?.roomId); // set room to the room ID
        setPlayers(r?.players); // set players array to the array of players in the room
        setOrientation(r?.players[0].orientation === "black" ? "white" : "black"); // set orientation as black
        setRoomDialogOpen(false); // close dialog
      });
      
    }
  }

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Start a New Chess Game</CardTitle>
          <CardDescription>Set up your game preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Game Mode</Label>
              <RadioGroup value={gameMode} onValueChange={setGameMode} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="start" id="start" />
                  <Label htmlFor="start">Start a game</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="join" id="join" />
                  <Label htmlFor="join">Join a game</Label>
                </div>
              </RadioGroup>
            </div>

            {gameMode === "start" ? (
              <>
                <div className="space-y-2">
                  <Label>Piece Color</Label>
                  <RadioGroup value={pieceColor} onValueChange={setPieceColor} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="white" id="white" />
                      <Label htmlFor="white">White</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="black" id="black" />
                      <Label htmlFor="black">Black</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="random" id="random" />
                      <Label htmlFor="random">Random</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Game Duration</Label>
                  <Select value={gameDuration} onValueChange={setGameDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select game duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  placeholder="Enter the room ID to join"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                />
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" onClick={handleSubmit}>
            {gameMode === "start" ? "Start Game" : "Join Game"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}