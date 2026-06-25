import { type ScoreCard, SCORE_CARDS } from "./cards.ts";

export async function promptMessage(message: string, delay: number = 1) {
  console.log(message);
  await wait(delay);
}

export function isScoreCard(card: string): card is ScoreCard {
  return (SCORE_CARDS as readonly string[]).includes(card)
}

export function wait(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}