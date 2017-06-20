# WDI-Project-1
My first project for WDI in London

### Introduction

Battleship is a popular turn based game where the aim of the game is to sink your opponent's ships before they sink yours. In a real life setting, both players would place their ships on their grid, and call out co-ordinates to hit ships on their opponent's grid. A hit is marked with a red counter while a miss is marked with a white counter.

In this version of Battleship, you'll play against the computer and your ships will be randomly placed for you at the start of the game.

You can access the game at [https://protected-waters-78340.herokuapp.com](https://protected-waters-78340.herokuapp.com).

<img width="1258" alt="screen shot 2017-04-06 at 13 28 04" src="https://cloud.githubusercontent.com/assets/15388548/24772208/4ed3ffb8-1b08-11e7-8459-7c32d0bb2cbe.png">

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

The code below shows the logic for finding spots to place the ships in on the grid.

```
Game.placeShipsOnGrid = function placeShipsOnGrid(){
  // Cycle through the player's and the computer's ships
  for (let p=0; p<Game.shipObjects.length;p++){
  
    // We're cycling through each ship from carrier to destroyer here
    for (let i=0; i<Game.shipObjects[p].length; i++){
    
      // Select a random proposed spot to start placing a ship
      const randomSpot = Math.floor(Math.random()*Math.pow(Game.gridWidth,2));
      const proposedLocations = [];

      // Check to see which orientations are feasible. The following if statements can be read as:
      // If this ship's size is less than or equal to the max size allowed in that orientation...
      
      // Check if ship can be oriented upwards
      if (Game.shipObjects[p][i].size <= Math.floor((randomSpot/Game.gridWidth)+1)){
        Game.calculateProposedLocations(randomSpot,proposedLocations,'North',p,i);
      }
      // Check if ship can be oriented rightwards
      if (Game.shipObjects[p][i].size <= Game.gridWidth-(randomSpot%Game.gridWidth)){
        Game.calculateProposedLocations(randomSpot,proposedLocations,'East',p,i);
      }
      // Check if ship can be oriented downwards
      if (Game.shipObjects[p][i].size <= Game.gridWidth-Math.floor(randomSpot/Game.gridWidth)){
        Game.calculateProposedLocations(randomSpot,proposedLocations,'South',p,i);
      }
      // Check if ship can be oriented leftwards
      if (Game.shipObjects[p][i].size <= (randomSpot%Game.gridWidth) +1){
        Game.calculateProposedLocations(randomSpot,proposedLocations,'West',p,i);
      }
      
      // If there are proposed locations for the ship, set the ship's location and draw it on the grid
      if (proposedLocations.length > 0){
        Game.shipObjects[p][i].location = Game.setShipOrientation(proposedLocations);
        
        // We only draw the ships for the human player and not the computer
        if (p===0){
          Game.shipImageOnGrid(Game.shipObjects[p][i].location,Game.shipObjects[p][i].unit,Game.shipObjects[p][i].size);
        }
      } else {
        i--; // Since no feasible locations are available, go through the loop again by decrementing i
      }
    } // End of for loop that cycles through ships
  } // End of for loop the cycles through the two players
}; // End of function placeShipsOnGrid
```
The code below places the ship images on the player's grid. It uses other functions such as `calcShipImgOrientation`, `calcShipImgCoords `, `calcShipImgRotation` and `calcImgTranslation` that are not displayed here for brevity. The ship image positions are calculated and the ship images rotated into place to fit on the grid.

```
// Put the ship images on the player's grid
Game.shipImageOnGrid = function shipImageOnGrid(shipLocation,unit,size){
  const imgWidth = Game.squareWidth+'px';
  const imgHeight = (Game.squareWidth*size)+'px';
  const shipDirection = Game.calcShipImgOrientation(shipLocation);
  let shipImgCoords = Game.calcShipImgCoords(shipLocation,shipDirection);
  const shipImgRotation = Game.calcShipImgRotation(shipDirection);
  const shipImgString = 'sea-warfare-set/'+unit+'-hull.png';

  for (let i = 0; i < shipLocation.length; i++) {
    $(Game.$mySquareList[shipLocation[i]]).removeClass('water').addClass('my-ships');
  }

  // Translation(moving the image) is required after rotation because it would be in the wrong spot otherwise
  shipImgCoords = Game.calcImgTranslation(shipDirection,imgHeight,shipImgCoords);
  const shipImgX = shipImgCoords[0]+'px';
  const shipImgY = shipImgCoords[1]+'px';

  $('.my-grid').append('<img src="'+ shipImgString +'" height="'+ imgHeight +'" width="'+ imgWidth +'">');
  // The img:last-child element is being used because we don't want to select the img elements that were created previously
  const $shipImg = $('.my-grid img:last-child');
  $shipImg.addClass(unit);
  $($shipImg).css({
    position: 'absolute', top: shipImgY, left: shipImgX,
    transform: 'rotate('+shipImgRotation+')',
    '-ms-transform': 'rotate('+shipImgRotation+')', /* IE 9 */
    '-moz-transform': 'rotate('+shipImgRotation+')', /* Firefox */
    '-webkit-transform': 'rotate('+shipImgRotation+')' /* Safari and Chrome */
  });
};
```

The AI system works by making the computer fire a shot on random squares until it hits a ship. When one spot is hit, the AI looks at the available spots to hit  and hits one of them. If it misses, it tries one of the next available spots. If it hits the ship a second time, the AI will select spots to hit in a line to bombard the rest of the ship.

The code below shows what the computer does when it hits a ship that belongs to the player for the first time. The AI wants to put its next possible shots into an array called `possibleNextShotLocation`. It analyses whether the next possible shots can be east, west, north or south of the spot that the computer just bombed. The if statements for each orientation check to see if the computer has already hit that proposed bombing location before, and if the proposed bombing location is inside the grid. If the proposed location is valid, it gets added to the `possibleNextShotLocation` array and one of these valid locations gets chosen by random and gets returned at the end of the function to be used in the computer's next turn.

```
Game.AINextMoveAfter1Hit = function AINextMoveAfter1Hit (){
  const oneHitDetectorResult = Game.AIOneHitDetection();
  const possibleNextShotLocation = [];
  if (oneHitDetectorResult !== false){
    if (!Game.computerGuesses.all.includes(oneHitDetectorResult+1) && (oneHitDetectorResult+1)%10!==0){
      possibleNextShotLocation.push(oneHitDetectorResult + 1);
    }
    if (!Game.computerGuesses.all.includes(oneHitDetectorResult-1) && (oneHitDetectorResult-1)%10!==9){
      possibleNextShotLocation.push(oneHitDetectorResult - 1);
    }
    if (!Game.computerGuesses.all.includes(oneHitDetectorResult + Game.gridWidth) && (oneHitDetectorResult+10)<Game.gridWidth*Game.gridWidth){
      possibleNextShotLocation.push(oneHitDetectorResult + 10);
    }
    if (!Game.computerGuesses.all.includes(oneHitDetectorResult - Game.gridWidth) && (oneHitDetectorResult-10)>-1) {
      possibleNextShotLocation.push(oneHitDetectorResult - 10);
    }
  } else {
    return false;
  }
  const arrayIndex = Math.floor((Math.random()*(possibleNextShotLocation.length)));
  return possibleNextShotLocation[arrayIndex];
};
```
The AI works differently when the computer hits 2 spots on one of the player's ships. This is because the computer now has the advantage of looking for the player's ship in a straight line. The AI assesses whether it needs to hunt for the player's ship vertically or horizontally by looking at the difference between the two hit locations.

```
Game.twoHitsDirection = function twoHitsDirection(hitLocationArray) {
  if (hitLocationArray === false) return false;
  const difference = hitLocationArray[0] - hitLocationArray[1];
  return (difference>=10 || difference <=-10) ? 'vertical':'horizontal';
};
```
As the AI now knows which direction to hunt, it needs to find the next possible location to bomb by entering either the 'vertical' or 'horizontal' if statement. The AI then cycles through the spots on the ship that have been bombed, and assesses whether the proposed bombing location is valid by checking that the spot was not previously bombed and that the proposed bombing location is on the grid, and places it in the array `possibleNextShotLocation`. It then selects a location at random from this array to return at the end of the function to use in the computer's next turn.

```
Game.AINextMoveAfter2Hits = function AINextMoveAfter2Hits() {
  const twoHitsDetectorResult = Game.AITwoHitsDetection();
  const possibleNextShotLocation = [];
  let directionToHunt;

  if (twoHitsDetectorResult!==false){
    directionToHunt = Game.twoHitsDirection(twoHitsDetectorResult);
  } else return false;

  if (directionToHunt === 'vertical' ){
    for (let i=0; i<twoHitsDetectorResult.length;i++){
      if (!Game.computerGuesses.all.includes(twoHitsDetectorResult[i]+10) && (twoHitsDetectorResult[i]+10) < 100){
        possibleNextShotLocation.push(twoHitsDetectorResult[i] + 10);
      }
      if (!Game.computerGuesses.all.includes(twoHitsDetectorResult[i]-10) && (twoHitsDetectorResult[i]-10) > -1){
        possibleNextShotLocation.push(twoHitsDetectorResult[i] - 10);
      }
    }
  } else if (directionToHunt === 'horizontal') {
    for (let i=0; i<twoHitsDetectorResult.length;i++){
      if (!Game.computerGuesses.all.includes(twoHitsDetectorResult[i]+1) && (twoHitsDetectorResult[i]+1)%10 !== 0){
        possibleNextShotLocation.push(twoHitsDetectorResult[i] + 1);
      }
      if (!Game.computerGuesses.all.includes(twoHitsDetectorResult[i]-1) && (twoHitsDetectorResult[i]-1)%10 !== 9){
        possibleNextShotLocation.push(twoHitsDetectorResult[i] - 1);
      }
    }
  } else {
    return false;
  }
  if (possibleNextShotLocation.length===0) return false;
  const arrayIndex = Math.floor((Math.random()*(possibleNextShotLocation.length)));
  return possibleNextShotLocation[arrayIndex];
};
```

If I had more time to spend on the project, I would improve the AI to avoid bombing squares where the player's remaining ships would definitely not be in.



### Tools used in this project
- HTML/CSS
- Javascript/jQuery

### Credits
- Ship silhouette images - [Clipart Fox](https://clipartfox.com/download/e0d7953a58e1c346c7e99fc0254d26cb5b89e82a.html)
- Ship image sprites - [Open Game Art](https://opengameart.org/content/sea-warfare-set-ships-and-more)
- Naval battle sounds - [Open Game Art](https://opengameart.org/content/tiny-naval-battle-sounds-set)
- Background music - _We Belong to the Sea - Part 2_ by _Sea of Åland_. Available at [Free Music Archive](http://freemusicarchive.org/music/Sea\_of_Aland/)

### Game Link
[https://protected-waters-78340.herokuapp.com](https://protected-waters-78340.herokuapp.com).