import { useEffect, useState, useCallback } from "react";
import ChessGame from "./Game";
import InitGame from "./InitGame";
import socket from "./socket";
import CustomAlert from "./components/CustomAlert";

export default function App() {

  const [room, setRoom] = useState("");
  const [orientation, setOrientation] = useState("");
  const [gameDuration, setGameDuration] = useState("")
  const [players, setPlayers] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [opponent, setOpponent] = useState("");

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
      const opponentObject = roomData.players[1] || null;
      const opponent = opponentObject ? opponentObject.username : "opponent";
      setOpponent(opponent);
      setShowAlert(true);
    });
  }, []);

  return (
    <>
      {showAlert && (
        <CustomAlert
          title="Opponent Joined"
          description={`${opponent} has joined the game. Get ready to play!`}
          style={{
            position: 'fixed',
            zIndex: 1000,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
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
  )
}