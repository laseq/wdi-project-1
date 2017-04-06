# WDI-Project-1
My first project for WDI in London

### Introduction

Battleship is a popular turn based game where the aim of the game is to sink your opponent's ships before they sink yours. In a real life setting, both players would place their ships on their grid, and call out co-ordinates to hit ships on their opponent's grid. A hit is marked with a red counter while a miss is marked with a white counter.

In this version of Battleship, you'll play against the computer and your ships will be randomly placed for you at the start of the game.

You can access the game at [https://protected-waters-78340.herokuapp.com](https://protected-waters-78340.herokuapp.com).

![Imgur](http://i.imgur.com/vQM1EZa.png)

### How to play

The player is given the instruction at the start to choose a square to bomb on the tracking grid. If you hit a ship, that square will turn red. Miss, and the square will turn a blueish white.

The player is informed about which ships they hit and sink in the information bar and boxes at the top.

The winner is the first player to destroy their enemy's fleet.

### Coding experience

The game's code can be split into 3 sections:
1. Placing the ships on the grids
2. The battle system
3. The AI

Placing the ships on the grid was a challenge because they needed to be placed completely within the grid while not overlapping any other ships. The positions of the ship sprite images on the grid were absolutely positioned and rotated into place.

The AI system works by making the computer fire a shot on random squares until it hits a ship. When one spot is hit, the AI looks at the available spots to hit  and hits one of them. If it misses, it tries one of the next available spots. If it hits the ship a second time, the AI will select spots to hit in a line to bombard the rest of the ship.

If I had more time to spend on the project, I would improve the AI to avoid bombing squares where the player's remaining ships would definitely not be in.



### Building tools
- HTML/CSS
- Javascript/jQuery

### Credits
- Ship silhouette images - [Clipart Fox](https://clipartfox.com/download/e0d7953a58e1c346c7e99fc0254d26cb5b89e82a.html)
- Ship image sprites - [Open Game Art](https://opengameart.org/content/sea-warfare-set-ships-and-more)
- Naval battle sounds - [Open Game Art](https://opengameart.org/content/tiny-naval-battle-sounds-set)
- Background music - _We Belong to the Sea - Part 2_ by _Sea of Åland_. Available at [Free Music Archive](http://freemusicarchive.org/music/Sea\_of_Aland/)