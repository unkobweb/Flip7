import Game from "./game.ts";
import Player from "./player.ts";
import c from 'chalk'
import { select, input } from '@inquirer/prompts'

const players = []

function greetingMessage() {
  console.log(c.bold.green('Welcome to Flip 7!'))
}

greetingMessage()
const playerName = await input({ message: 'Enter first player name:' })
players.push(new Player(playerName))

console.clear()
greetingMessage()
const secondPlayerName = await input({ message: 'Enter second player name:' })
players.push(new Player(secondPlayerName))

let choice = 'play'
do {
  console.clear()
  greetingMessage()
  console.log('Players:', players.map(p => p.name).join(', '))
  choice = await select({
    message: 'What do you want to do?',
    choices: [
      { name: 'Play', value: 'play' },
      { name: 'Add player', value: 'add' },
    ],
  })

  if (choice === 'add') {
    const playerName = await input({ message: 'Enter player name:' })
    players.push(new Player(playerName))
  }
} while (choice !== 'play')

const game = new Game(players)

game.start()