import Cards from "./cards.ts"

console.log('Flip 7')

const deck = new Cards()
deck.initializeDeck()
deck.shuffle()
console.log(deck.cards)