/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
"use client"

import { useState, useEffect } from "react"
//import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const GameAlertType = {
  GAME_OVER: "gameOver",
  GAME_DRAW: "gameDraw", 
  PLAYER_DISCONNECTED: "playerDisconnected"
}

/**
 * @typedef {Object} GameAlertDialogProps
 * @property {typeof GameAlertType[keyof typeof GameAlertType]} type
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {string} [winner]
 */

//function CustomDialog({ type, isOpen, onClose, winner }) {
  function CustomDialog({ isOpen, onClose, title }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  const handleNewGame = () => {
    handleClose()
    // router.push("/init-game")
  }

  // const getAlertContent = () => {
  //   switch (type) {
  //     case "gameOver":
  //       return {
  //         title: "Game Over",
  //         description: winner ? `${winner} has won the game!` : "The game has ended.",
  //       }
  //     case "gameDraw":
  //       return {
  //         title: "Game Draw",
  //         description: "The game has ended in a draw.",
  //       }
  //     case "playerDisconnected":
  //       return {
  //         title: "Player Disconnected",
  //         description: "Your opponent has disconnected from the game.",
  //       }
  //     default:
  //       return {
  //         title: "Game Alert",
  //         description: "An unexpected event has occurred.",
  //       }
  //   }
  // }

  // const { title, description } = getAlertContent()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{title}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Close</AlertDialogCancel>
          <AlertDialogAction onClick={handleNewGame}>New Game</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CustomDialog;