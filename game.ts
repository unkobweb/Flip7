import Cards, { SCORE_CARDS } from "./cards.ts"
import { select } from '@inquirer/prompts';
import Player from "./player.ts";
import { isScoreCard, promptMessage, wait } from "./utils.ts";
import Table from 'cli-table3';
import chalk from 'chalk';

export default class Game {
  private round = 1;
  private players: Player[];
  private deck: Cards;
  
  constructor(players: Player[]) {
    this.players = players;
    this.deck = new Cards();
    this.deck.initializeDeck();
    this.deck.shuffle();
  }
  
  public async start() {
    console.log('Round ' + this.round)
  
    while (true) {
      const notStoppedPlayers = this.players.filter(player => !player.isStopped)
      if (notStoppedPlayers.length === 0) {
        this.finishRound();
        continue;
      }
      for (const player of notStoppedPlayers) {
        if (player.isStopped) continue;
        await wait(1);
        console.clear()
        this.displayScores()

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
          await this.drawACard(player);
        } else {
          player.isStopped = true;
        }
      }
    }
  }

  private displayScores() {
    const table = new Table({
      head: ['Player', 'Score', 'Hand'],
      colWidths: [20, 10, 50]
    });
    for (const player of this.players) {
      let hand = player.hand.join(', ');
      let handStr = hand;
      if (player.isStopped) {
        handStr = [hand, chalk.italic.gray('(stopped)')].join(' - ');
      }
      table.push([player.name, player.score, handStr])
    }
    console.log(chalk.red('Round ' + this.round))
    console.log(table.toString())
  }

  private finishRound() {
    this.round++;
    console.log('Round ' + this.round)
    for (const player of this.players) {
      player.isStopped = false;
      const handValue = player.getHandValue();
      console.log(`${player.name}'s hand value: ${handValue.previousScore} -> ${handValue.newScore} (round: ${handValue.roundScore})`);
      this.deck.addCardsToBin(...player.flushHand());
    }
    if (this.players.some(player => player.score >= 200)) {
      console.log('Game over!')
      const sortedPlayers = this.players.sort((a, b) => b.score - a.score);
      console.log('Final scores:')
      for (const player of sortedPlayers) {
        console.log(`${player.name}: ${player.score}`)
      }
      process.exit(0);
    }
  } 

  private async drawACard(player: Player) {
    const card = this.deck.drawCard();
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
          this.deck.addCardsToBin(card)
          player.hasSecondChance = false
          return
        }

        promptMessage("You've busted!")
        player.isStopped = true;
        const flushedHand = player.flushHand();
        this.deck.addCardsToBin(...flushedHand);
        return;
      }
    }
    if (card === '3_IN_A_ROW') {
      const playerWhoWillDraw = await select({
        message: 'Which player will draw 3 cards in a row?',
        choices: this.players.filter(p => !p.isStopped).map(player => ({ name: player.name, value: player })),
      })
      
      promptMessage(`${playerWhoWillDraw.name} draws 3 cards in a row`)
      for (let i = 0; i < 3; i++) {
        await this.drawACard(playerWhoWillDraw)
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
        choices: this.players.filter(p => !p.isStopped).map(player => ({ name: player.name, value: player })),
      })
      playerThatWillBeStopped.isStopped = true
      return
    }
    
    player.addCardToHand(card!);
  }
}