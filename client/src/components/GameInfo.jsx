/* eslint-disable react/prop-types */
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight} from 'lucide-react'

function GameInfo({ opponent, gameDuration, isGameActive, startGame }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">Game Info</h2>
        <div className="space-y-2">
          <p>
            <strong>Opponent:</strong> {opponent.length > 15 
              ? `${opponent.slice(0, 15)}...` 
              : opponent}
          </p>
          <p>
            <strong>Time Control:</strong> {gameDuration} min 
          </p>
          <p>
            <strong>Game Status:</strong>{' '}
            {isGameActive ? 'In Progress' : 'Game Over'}
          </p>
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={startGame}>
            New Game
          </Button>
          <Button variant="outline" onClick={() => alert('Draw offered!')}>
            Offer Draw
          </Button>
          <Button onClick={() => alert('Moving to next game...')}>
            Next Game
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default GameInfo
