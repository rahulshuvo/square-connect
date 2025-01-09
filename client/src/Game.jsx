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
import CustomDialog from './components/CustomDialog'
import './Game.scss'

export default function ChessGame({
  players,
  room,
  orientation,
  gameDuration,
  cleanup,
}) {
  const opponentObject =
    players.find((player) => player.orientation !== orientation) || null
  const opponentName = opponentObject
    ? opponentObject.username
    : 'opponent not found'
  const currentPlayerObject =
    players.find((player) => player.orientation === orientation) || null
  const currentPlayerName = currentPlayerObject
    ? currentPlayerObject.username
    : 'Player not found'
  const chess = useMemo(() => new Chess(), [])
  const [fen, setFen] = useState(chess.fen())
  const [over, setOver] = useState('')
  const [whiteTime, setWhiteTime] = useState(gameDuration * 60)
  const [blackTime, setBlackTime] = useState(gameDuration * 60)
  const [showVideoChat, setShowVideoChat] = useState(true)
  const [showTextChat, setShowTextChat] = useState(true)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio('/move.mp3')
  }, [])

  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move)
        setFen(chess.fen())
        if (isSoundEnabled) {
          audioRef.current.play()
        }
        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            setOver(
              `Checkmate! ${chess.turn() === 'w' ? 'black' : 'white'} wins!`
            )
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
    [chess, isSoundEnabled]
  )

  function onDrop(sourceSquare, targetSquare, piece) {
    if (chess.turn() !== orientation[0]) return false

    if (players.length < 2) return false

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: piece[1].toLowerCase() ?? 'q',
    }

    const move = makeAMove(moveData)

    if (move === null) return false

    socket.emit('move', {
      move,
      room,
    })

    return true
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  useEffect(() => {
    socket.on('move', (move) => {
      makeAMove(move)
    })
  }, [makeAMove])

  useEffect(() => {
    socket.on('playerDisconnected', (player) => {
      setOver(`${player.username} has disconnected`)
    })
  }, [])

  useEffect(() => {
    socket.on('closeRoom', ({ roomId }) => {
      if (roomId === room) {
        cleanup()
      }
    })
  }, [room, cleanup])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const copyRoomLink = () => {
    const link = `${window.location.origin}?roomId=${room}`
    navigator.clipboard.writeText(link).then(
      () => {
        setCopied(true)
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
    <div className="game-container">
      <div className="game-content">
        <div className="game-board-container">
          <Card className="game-card">
            <CardContent className="game-card-content">
              <div className="game-header">
                <div className="timer-container">
                  <p className="timer-title">
                    {orientation === 'black' ? 'White' : 'Black'}
                  </p>
                  <p className="timer">
                    {orientation === 'black'
                      ? formatTime(whiteTime)
                      : formatTime(blackTime)}
                  </p>
                </div>
                <p className="opponent-name">{opponentName}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyRoomLink}
                  className="copy-button"
                >
                  {copied ? (
                    <CopyCheck className="icon" />
                  ) : (
                    <Copy className="icon" />
                  )}
                  {copied ? 'Copied' : 'Copy GameLink'}
                </Button>
              </div>
              <div className="chessboard-container">
                <Chessboard
                  position={fen}
                  onPieceDrop={onDrop}
                  boardOrientation={orientation}
                />
              </div>
              <div className="game-footer">
                <div className="timer-container">
                  <p className="timer-title">
                    {orientation === 'black' ? 'Black' : 'White'}
                  </p>
                  <p className="timer">
                    {orientation === 'black'
                      ? formatTime(blackTime)
                      : formatTime(whiteTime)}
                  </p>
                </div>
                <p className="current-player-name">{currentPlayerName}</p>
                <div className="settings-container">
                  <div className="setting-item">
                    <Switch
                      id="video-chat-toggle"
                      checked={showVideoChat}
                      onCheckedChange={setShowVideoChat}
                    />
                    <label htmlFor="video-chat-toggle">Video Chat</label>
                  </div>
                  <div className="setting-item">
                    <Switch
                      id="text-chat-toggle"
                      checked={showTextChat}
                      onCheckedChange={setShowTextChat}
                    />
                    <label htmlFor="text-chat-toggle">Text Chat</label>
                  </div>
                  <div className="setting-item">
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
        </div>
        <div className="side-panels">
          <div className={showVideoChat ? '' : 'hidden'}>
            <VideoChat room={room} />
          </div>
          <div className={showTextChat ? '' : 'hidden'}>
            <Chat room={room} />
          </div>
        </div>
      </div>
      <CustomDialog
        isOpen={Boolean(over)}
        onClose={() => setOver('')}
        title={over}
      />
    </div>
  )
}
