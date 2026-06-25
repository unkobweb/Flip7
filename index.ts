import Game from "./game.ts";
import Player from "./player.ts";

console.log('Welcome to Flip 7!')

const game = new Game([
  new Player('Alexandre'),
  new Player('John'),
])

game.start()