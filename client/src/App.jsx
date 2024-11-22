import { useEffect, useState, useCallback } from "react";
import ChessGame from "./Game";
import InitGame from "./InitGame";
import socket from "./socket";

export default function App() {

  const [room, setRoom] = useState("");
  const [orientation, setOrientation] = useState("");
  const [gameDuration, setGameDuration] = useState("")
  const [players, setPlayers] = useState([]);

  // resets the states responsible for initializing a game
  const cleanup = useCallback(() => {
    setRoom("");
    setOrientation("");
    setPlayers("");
    setGameDuration("10");
  }, []);

  useEffect(() => {
    socket.on("opponentJoined", (roomData) => {
      setPlayers(roomData.players);
    });
  }, []);

  return (
    <>
      {room ? (
        <ChessGame 
          room={room}
          orientation={orientation}
          players={players}
          gameDuration={gameDuration}
          cleanup={cleanup}
        />
      ) : (
        <InitGame
        setRoom={setRoom}
        setOrientation={setOrientation}
        setPlayers={setPlayers}
        setGameDuration={setGameDuration}
        />
      )}
      </>
  );
}