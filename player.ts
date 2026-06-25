import type { Card } from "./cards.ts";
import { isScoreCard } from "./utils.ts";

export default class Player {
  public name: string;
  public hand: Card[] = [];
  public isStopped: boolean = false;
  public hasSecondChance: boolean = false;
  public score: number = 0;

  constructor(name: string) {
    this.name = name;
  }

  addCardToHand(card: Card) {
    this.hand.push(card);
  }

  flushHand(): Card[] {
    const currentHand = this.hand;
    this.hand = [];
    return currentHand;
  }
  
  getHandValue(): {previousScore: number, roundScore: number, newScore: number} {
    const actualScore = this.score
    let score = 0;
    const scoreCardsValues = this.hand.filter(card => isScoreCard(card)).map(card => parseInt(card));
    score += scoreCardsValues.reduce((acc, value) => acc + value, 0);
    if (this.hand.includes('x2')) score *= 2;

    if (this.hand.includes('+2')) score += 2;
    if (this.hand.includes('+4')) score += 4;
    if (this.hand.includes('+6')) score += 6;
    if (this.hand.includes('+8')) score += 8;
    if (this.hand.includes('+10')) score += 10;

    this.score += score

    return {previousScore: actualScore, roundScore: score, newScore: this.score};
  }
}
