import PropTypes from 'prop-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight} from 'lucide-react'

function GameInfo({currentPlayer, isGameActive, startGame }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">Game Info</h2>
        <div className="space-y-2">
          <p>
            <strong>Opponent:</strong> GrandMaster123
          </p>
          <p>
            <strong>Your Color:</strong> White
          </p>
          <p>
            <strong>Time Control:</strong> 10 min | 5 sec increment
          </p>
          <p>
            <strong>Current Turn:</strong>{' '}
            {currentPlayer === 'w' ? 'White' : 'Black'}
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

GameInfo.propTypes = {
  currentPlayer: PropTypes.oneOf(['w', 'b']).isRequired,
  isGameActive: PropTypes.bool.isRequired,
  startGame: PropTypes.func.isRequired
}

export default GameInfo
