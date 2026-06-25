import Cards, { SCORE_CARDS } from "./cards.ts"
import { select } from '@inquirer/prompts';
import Player from "./player.ts";
import { isScoreCard, promptMessage, wait } from "./utils.ts";

console.log('Welcome to Flip 7!')

const deck = new Cards()
deck.initializeDeck()
deck.shuffle()

const alex = new Player('Alex')
const leon = new Player('Leon')

const players = [alex, leon];

async function drawACard(player: Player) {
  const card = deck.drawCard();
  console.log('You draw a '+card)
  
  if (player.hand.includes(card)) {
    promptMessage('You already have a '+card+' !')

    if (isScoreCard(card)) {
      if (!player.hand.includes(card)) {
        player.addCardToHand(card!);
        return;
      }
      
      if (player.hasSecondChance) {
        promptMessage('God bless, you have a second chance !')
        deck.addCardsToBin(card)
        player.hasSecondChance = false
        return
      }

      promptMessage("You've busted!")
      player.isStopped = true;
      const flushedHand = player.flushHand();
      deck.addCardsToBin(...flushedHand);
      return;
    }
  }
  if (card === '3_IN_A_ROW') {
    const playerWhoWillDraw = await select({
      message: 'Which player will draw 3 cards in a row?',
      choices: players.filter(p => !p.isStopped).map(player => ({ name: player.name, value: player })),
    })
    
    promptMessage(`${playerWhoWillDraw.name} draws 3 cards in a row`)
    for (let i = 0; i < 3; i++) {
      await drawACard(playerWhoWillDraw)
    }
    return;
  }
  
  if (card === 'SECOND_CHANCE') {
    player.hasSecondChance = true
    return;
  }
  
  if (card === 'STOP') {
    const playerThatWillBeStopped = await select({
      message: 'Which player will be stopped?',
      choices: players.filter(p => !p.isStopped).map(player => ({ name: player.name, value: player })),
    })
    playerThatWillBeStopped.isStopped = true
    return
  }
  
  player.addCardToHand(card!);
}

function finishRound() {
  round++;
  console.log('Round ' + round)
  for (const player of players) {
    player.isStopped = false;
    const handValue = player.getHandValue();
    console.log(`${player.name}'s hand value: ${handValue.previousScore} -> ${handValue.newScore} (round: ${handValue.roundScore})`);
    deck.addCardsToBin(...player.flushHand());
  }
  if (players.some(player => player.score >= 200)) {
    console.log('Game over!')
    const sortedPlayers = players.sort((a, b) => b.score - a.score);
    console.log('Final scores:')
    for (const player of sortedPlayers) {
      console.log(`${player.name}: ${player.score}`)
    }
    process.exit(0);
  }
}

let round = 1;
console.log('Round ' + round)
while (true) {
  const notStoppedPlayers = players.filter(player => !player.isStopped)
  if (notStoppedPlayers.length === 0) {
    finishRound();
    continue;
  }
  for (const player of notStoppedPlayers) {
    await wait(1);
    console.clear()
    console.log(`${player.name}'s turn`);
    console.log(player.name+"'s hand :"+' '+player.hand+'\n\n');

    let move = 'draw'

    if (player.hand.length > 0) {
      move = await select({
        message: `What do you want to do, ${player.name}?`,
        choices: [
          { name: 'Draw a card', value: 'draw' },
          { name: 'Stop', value: 'stop' },
        ],
      });
    } 
    if (move === 'draw') {
      await drawACard(player);
    } else {
      player.isStopped = true;
    }
  }
}