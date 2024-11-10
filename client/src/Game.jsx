/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Copy, CopyCheck } from 'lucide-react'
import socket from './socket'

import VideoChat from './components/VideoChat'
import Chat from './components/Chat'
import GameInfo from './components/GameInfo'
import CustomDialog from './components/CustomDialog'

export default function ChessGame({ players, room, orientation, cleanup }) {
  const chess = useMemo(() => new Chess(), [])
  const [fen, setFen] = useState(chess.fen())
  const [over, setOver] = useState('')

  const [game, setGame] = useState(new Chess())
  const [whiteTime, setWhiteTime] = useState(600) // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState(600) // 10 minutes in seconds
  const [isGameActive, setIsGameActive] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState('w')
  const [messages, setMessages] = useState([])
  const [showVideoChat, setShowVideoChat] = useState(true)
  const [showTextChat, setShowTextChat] = useState(true)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)
  const chatRef = useRef(null)
  const audioRef = useRef(new Audio('/move-sound.mp3'))

  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move) // update Chess instance
        setFen(chess.fen()) // update fen state to trigger a re-render

        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            setOver(
              `Checkmate! ${chess.turn() === 'w' ? 'black' : 'white'} wins!`
            )
            // The winner is determined by checking which side made the last move
          } else if (chess.isDraw()) {
            setOver('Draw')
          } else {
            setOver('Game over')
          }
        }

        return result
      } catch (e) {
        console.log('error', e)
        return null
      }
    },
    [chess]
  )

  // onDrop function
  function onDrop(sourceSquare, targetSquare) {
    
    if (chess.turn() !== orientation[0]) return false 

    if (players.length < 2) return false

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: 'q', // promote to queen where possible
    }

    const move = makeAMove(moveData)

    // illegal move
    if (move === null) return false

    socket.emit('move', {
      move,
      room,
    })

    return true
  }

  useEffect(() => {
    socket.on('move', (move) => {
      makeAMove(move)
    })
  }, [makeAMove])

  useEffect(() => {
    socket.on('playerDisconnected', (player) => {
      setOver(`${player.username} has disconnected`) // set game over
    })
  }, [])

  useEffect(() => {
    socket.on('closeRoom', ({ roomId }) => {
      if (roomId === room) {
        cleanup()
      }
    })
  }, [room, cleanup])

  const startGame = () => {
    setIsGameActive(true)
    setGame(new Chess())
    setWhiteTime(600)
    setBlackTime(600)
    setCurrentPlayer('w')
    setMessages([])
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(decrementTime, 1000)
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  const decrementTime = useCallback(() => {
    if (isGameActive) {
      if (currentPlayer === 'w') {
        setWhiteTime((prevTime) => {
          if (prevTime <= 0) {
            setIsGameActive(false)
            clearInterval(timerRef.current)
            return 0
          }
          return prevTime - 1
        })
      } else {
        setBlackTime((prevTime) => {
          if (prevTime <= 0) {
            setIsGameActive(false)
            clearInterval(timerRef.current)
            return 0
          }
          return prevTime - 1
        })
      }
    }
  }, [currentPlayer, isGameActive])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const chatContainer = chatRef.current
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, [messages])

  // function makeAMove(move) {
  //   const gameCopy = new Chess(game.fen())

  //   try {
  //     const result = gameCopy.move(move)
  //     setGame(gameCopy)
  //     setCurrentPlayer(gameCopy.turn())
  //     if (isSoundEnabled) {
  //       audioRef.current.play()
  //     }
  //     return result
  //   } catch (error) {
  //     console.error('Invalid move:', error)
  //     return null
  //   }
  // }

  // function onDrop(sourceSquare, targetSquare) {
  //   const move = makeAMove({
  //     from: sourceSquare,
  //     to: targetSquare,
  //     promotion: 'q', // always promote to a queen for example simplicity
  //   })

  //   if (move === null) return false

  //   if (currentPlayer === 'w') {
  //     setWhiteTime((prevTime) => Math.min(prevTime + 5, 600))
  //   } else {
  //     setBlackTime((prevTime) => Math.min(prevTime + 5, 600))
  //   }

  //   return true
  // }

  const copyRoomLink = () => {
    //const link = `${window.location.origin}?roomId=${room}`
    const link = room
    navigator.clipboard.writeText(link).then(
      () => {
        console.log('Link copied to clipboard: ', link), setCopied(true),
          setTimeout(() => {
            setCopied(false)
          }, 3000)
      },
      (err) => {
        console.error('Could not copy text: ', err)
      }
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Square Connect</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div
                  className={`p-2 rounded ${
                    currentPlayer === 'b'
                      ? 'bg-primary text-primary-foreground'
                      : ''
                  }`}
                >
                  <p className="font-semibold">
                    {orientation == 'black' ? 'White' : 'Black'}
                  </p>
                  <p className="text-2xl font-mono">
                    {orientation == 'black'
                      ? formatTime(whiteTime)
                      : formatTime(blackTime)}
                  </p>
                </div>
                <div className="font-semibold">Room ID: {room}</div>
                <Button variant="outline" size="sm" onClick={copyRoomLink}>
                  {copied ? (
                    <CopyCheck className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied? "Copied" : "Copy RoomId"}
                </Button>
              </div>
              <div className="aspect-square w-full max-w-[600px] mx-auto">
                <Chessboard
                  position={fen}
                  onPieceDrop={onDrop}
                  boardOrientation={orientation}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div
                  className={`p-2 rounded ${
                    currentPlayer === 'w'
                      ? 'bg-primary text-primary-foreground'
                      : ''
                  }`}
                >
                  <p className="font-semibold">
                    {orientation == 'black' ? 'Black' : 'White'}
                  </p>
                  <p className="text-2xl font-mono">
                    {orientation == 'black'
                      ? formatTime(blackTime)
                      : formatTime(whiteTime)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="video-chat-toggle"
                      checked={showVideoChat}
                      onCheckedChange={setShowVideoChat}
                    />
                    <label htmlFor="video-chat-toggle">Video Chat</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="text-chat-toggle"
                      checked={showTextChat}
                      onCheckedChange={setShowTextChat}
                    />
                    <label htmlFor="text-chat-toggle">Text Chat</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sound-toggle"
                      checked={isSoundEnabled}
                      onCheckedChange={setIsSoundEnabled}
                    />
                    <label htmlFor="sound-toggle">Sound</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <GameInfo
            currentPlayer={currentPlayer}
            isGameActive={isGameActive}
            startGame={startGame}
          />
        </div>
        <div className="lg:w-1/3 space-y-6">
          {showVideoChat && <VideoChat room={room} />}
          {showTextChat && <Chat room={room} />}
        </div>
      </div>

      <CustomDialog
        isOpen={Boolean(over)}
        //type={"playerDisconnected"}
        onClose={() => setOver('')}
        //winner={over}
        title={over}
      />
    </div>
  )
}
