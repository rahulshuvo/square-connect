/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import socket from './socket';
import CustomAlert from './components/CustomAlert';
import './InitGame.scss';

export default function InitGame({
  setRoom,
  setOrientation,
  setGameDuration,
  setPlayers,
}) {
  const [username, setUsername] = useState('');
  const [gameMode, setGameMode] = useState('start');
  const [pieceColor, setPieceColor] = useState('random');
  const [gameTime, setGameTime] = useState('10');
  const [roomId, setRoomId] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [isRoomIdFromUrl, setIsRoomIdFromUrl] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = urlParams.get('roomId');

    if (roomIdFromUrl) {
      setIsRoomIdFromUrl(true);
      setRoomId(roomIdFromUrl);
      setGameMode('join');
    }
  }, []);

  const getRandomColor = () => {
    return Math.random() < 0.5 ? 'white' : 'black';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || username.length < 1 || username.length > 15) {
      return alert('Please set Username.');
    }

    const finalColor = pieceColor === 'random' ? getRandomColor() : pieceColor;

    socket.emit('username', username);
    socket.emit('setOrientation', finalColor);
    socket.emit('setGameDuration', gameTime);
    if (gameMode === 'start') {
      socket.emit('createRoom', (r) => {
        setRoom(r);
        setOrientation(finalColor);
        setGameDuration(gameTime);
      });
    } else {
      socket.emit('joinRoom', { roomId: roomId }, (r) => {
        if (r.error) {
          setShowAlert(true);
          return setRoomError(r.message);
        }
        setRoom(r?.roomId);
        setPlayers(r?.players);
        setOrientation(
          r?.players[0].orientation === 'black' ? 'white' : 'black'
        );
        setRoomDialogOpen(false);
        setGameDuration(r?.gameDuration);
      });
    }
  };

  return (
    <>
      {showAlert && (
        <CustomAlert
          title="Error"
          description={roomError}
          style={{
            position: 'fixed',
            zIndex: 1000,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      <div className="form-container">
        <Card className="card-container">
          <CardHeader>
            <CardTitle>Start a New Chess Game</CardTitle>
            <CardDescription>Set up your game preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="form">
              <div className="input-field">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-field">
                <Label>Game Mode</Label>
                <RadioGroup
                  value={gameMode}
                  onValueChange={setGameMode}
                  className="radio-group"
                  disabled={isRoomIdFromUrl}
                >
                  <div className="radio-item">
                    <RadioGroupItem value="start" id="start" />
                    <Label htmlFor="start">Start a game</Label>
                  </div>
                  <div className="radio-item">
                    <RadioGroupItem value="join" id="join" />
                    <Label htmlFor="join">Join a game</Label>
                  </div>
                </RadioGroup>
              </div>

              {gameMode === 'start' ? (
                <>
                  <div className="input-field">
                    <Label>Piece Color</Label>
                    <RadioGroup
                      value={pieceColor}
                      onValueChange={setPieceColor}
                      className="radio-group"
                    >
                      <div className="radio-item">
                        <RadioGroupItem value="white" id="white" />
                        <Label htmlFor="white">White</Label>
                      </div>
                      <div className="radio-item">
                        <RadioGroupItem value="black" id="black" />
                        <Label htmlFor="black">Black</Label>
                      </div>
                      <div className="radio-item">
                        <RadioGroupItem value="random" id="random" />
                        <Label htmlFor="random">Random</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="input-field">
                    <Label htmlFor="duration">Game Duration</Label>
                    <Select value={gameTime} onValueChange={setGameTime} className="select">
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
                <div className="input-field">
                  <Label htmlFor="roomId">Room ID</Label>
                  <Input
                    id="roomId"
                    placeholder="Enter the room ID to join"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    required
                    disabled={isRoomIdFromUrl}
                  />
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="submit-button" onClick={handleSubmit}>
              {gameMode === 'start' ? 'Start Game' : 'Join Game'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
