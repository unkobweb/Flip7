export const SCORE_CARDS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const
export const ACTION_CARDS = ['STOP', '3_IN_A_ROW', 'SECOND_CHANCE'] as const
export const BONUS_CARDS = ['+2', '+4', '+6', '+8', '+10', 'x2'] as const

export type ScoreCard = (typeof SCORE_CARDS)[number]
export type ActionCard = (typeof ACTION_CARDS)[number]
export type BonusCard = (typeof BONUS_CARDS)[number]

export type Card = ScoreCard | ActionCard | BonusCard

export default class Cards {
  public cards: Card[] = [];
  public bin: Card[] = [];

  constructor() {}

  initializeDeck() {
    this.cards = ['0', '+2', '+4', '+6', '+8', '+10', 'x2'];
    for (let i = 0; i <= 12; i++) {
      for (let j = 0; j < i; j++) {
        this.cards.push(i.toString() as Card);
      }
    }
    // Add 3 sample of each special card
    for (let i = 0; i < 3; i++) {
      this.cards.push('STOP', '3_IN_A_ROW', 'SECOND_CHANCE');
    }
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  drawCard(): Card {
    if (this.cards.length === 0) {
      console.log('Reshuffling deck... (No card left)');
      this.cards = [...this.bin];
      this.bin = [];
      this.shuffle();
    }
    return this.cards.pop()!;
  }

  addCardsToBin(...cards: Card[]) {
    this.bin.push(...cards);
  }
}
