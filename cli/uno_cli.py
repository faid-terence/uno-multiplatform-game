import random

# Card colors and values
COLORS = ["Red", "Green", "Blue", "Yellow"]
VALUES = [str(n) for n in range(0, 10)] + ["Skip", "Reverse", "Draw Two"]
SPECIALS = ["Wild", "Wild Draw Four"]

def make_deck():
    deck = []
    for color in COLORS:
        for value in VALUES:
            deck.append((color, value))
            if value != "0":  # Two of each except 0
                deck.append((color, value))
    for special in SPECIALS:
        deck += [("Black", special)] * 4
    random.shuffle(deck)
    return deck

def print_hand(hand):
    for i, card in enumerate(hand):
        print(f"{i}: {card[0]} {card[1]}")

def valid_play(card, top_card):
    return (card[0] == top_card[0] or card[1] == top_card[1] or card[0] == "Black")

def main():
    deck = make_deck()
    hands = [[deck.pop() for _ in range(7)] for _ in range(4)]
    discard = [deck.pop()]
    turn, direction = 0, 1

    while True:
        print(f"\nPlayer {turn+1}'s turn. Top card: {discard[-1][0]} {discard[-1][1]}")
        print_hand(hands[turn])

        playable = [i for i, c in enumerate(hands[turn]) if valid_play(c, discard[-1])]
        if not playable:
            print("No playable card. Drawing...")
            hands[turn].append(deck.pop())
        else:
            idx = int(input(f"Choose card index to play {playable}: "))
            card = hands[turn].pop(idx)
            discard.append(card)
            if card[1] == "Skip":
                print("Next player skipped!")
                turn = (turn + direction) % 4
            elif card[1] == "Reverse":
                direction *= -1
                print("Direction reversed!")
            elif card[1] == "Draw Two":
                next_player = (turn + direction) % 4
                hands[next_player] += [deck.pop(), deck.pop()]
                print(f"Player {next_player+1} draws two cards!")
            elif card[1] == "Wild Draw Four":
                next_player = (turn + direction) % 4
                hands[next_player] += [deck.pop(), deck.pop(), deck.pop(), deck.pop()]
                print(f"Player {next_player+1} draws four cards!")
            if not hands[turn]:
                print(f"Player {turn+1} wins!")
                break

        turn = (turn + direction) % 4

if __name__ == "__main__":
    main()
