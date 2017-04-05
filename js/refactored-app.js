var Game = Game || {};

Game.gridWidth = 10;
Game.squareWidth = 37; // Used for the ship images
Game.hitsToWin = 17;
Game.gameOver = false;
Game.compMoveTimeDelay = 100;
Game.soundDelay = 550;
Game.sfxMuted = false;


Game.createGrids = function createGrids() {
  // Create ul's and li's to become the x and y-axis labels for the grids
  for (let i=1; i<3; i++) {
    const axis = (i>=2) ? 'y':'x';
    $('.grid-container').append('<ul>');
    $('.grid-container ul:nth-child('+ i +')').addClass('grid-'+ axis +'-axis');
  }
  // Create the li elements for these 4 ul elements
  for (let i = 0; i < 20; i++) {
    const axis = (i>=10) ? 'y':'x';
    $('.grid-'+ axis +'-axis').append('<li>');
  }
  // Add class grid-number-labels to the x-axis, and grid-letter-labels to the y-axis
  $('.grid-x-axis li').addClass('grid-number-labels');
  $('.grid-y-axis li').addClass('grid-letter-labels');
  // Label the grid axes with letters on the y-axis and numbers on the x-axis
  const lettersForGridYAxis = ['A','B','C','D','E','F','G','H','I','J'];
  for (let i = 0; i < 10; i++) {
    $('.grid-number-labels:nth-child('+ (i+1) +')').text(i+1);
    $('.grid-letter-labels:nth-child('+ (i+1) +')').text(lettersForGridYAxis[i]);
  }
  // Put 2 ul's in their respective columns to be the player's ship grid and the player's tracking grid
  $('.player-column .grid-container').append('<ul class="grid my-grid"></ul>');
  $('.tracking-column .grid-container').append('<ul class="grid tracking-grid"></ul>');
  // Create the li elements for the two grids. A 10x10 grid results in 100 li elements for each grid
  for (let i=0; i<100; i++){
    $('.grid').append('<li>');
  }
  // Add classes to the squares in each grid
  Game.$mySquareList = $('.my-grid li');
  Game.$trackingSquareList = $('.tracking-grid li');
  $(Game.$mySquareList).addClass('squares my-squares water');
  $(Game.$trackingSquareList).addClass('squares tracking-squares water');
}; // End of function Game.createGrids

// Create a ship constructor
Game.ship = function ship(unit,size,player){
  this.unit = unit;
  this.size = size;
  this.location = [];
  this.hitLocation = [];
  this.player = player;
};

Game.createShips = function createShips(){
  Game.shipObjects = []; // Create an multi dimensional array to hold player and computer ships
  Game.shipObjects[0] = []; // This creates the array to hold the player's ships
  Game.shipObjects[1] = []; // This creates the array to hold the computer's ships
  Game.shipNameAndSizeArray = [['carrier',5],['battleship',4],['cruiser',3],['submarine',3],['destroyer',2]];
  for (let i=0; i<Game.shipNameAndSizeArray.length;i++){
    Game.shipObjects[0].push(new Game.ship(Game.shipNameAndSizeArray[i][0],Game.shipNameAndSizeArray[i][1],'human'));
    Game.shipObjects[1].push(new Game.ship(Game.shipNameAndSizeArray[i][0],Game.shipNameAndSizeArray[i][1],'computer'));
  }
};

Game.placeShipsOnGrid = function placeShipsOnGrid(){

  //**********FUNCTIONS BELOW HERE**********
  Game.calculateProposedLocations = function calculateProposedLocations(randomSpot,proposedLocations,alignment,p,i){
    proposedLocations.push(Game.computeAlignment(randomSpot,Game.shipObjects[p][i].size,alignment));
    if (Game.doShipsOverlap(proposedLocations,i,Game.shipObjects[p])) proposedLocations.pop();
  };

  Game.computeAlignment = function computeAlignment(origin,size,alignment){
    const array = [];
    for (let i=0; i<size; i++){
      if (alignment === 'North')array.push(origin-i*Game.gridWidth);
      if (alignment === 'East') array.push(origin+i);
      if (alignment === 'South') array.push(origin+i*Game.gridWidth);
      if (alignment === 'West') array.push(origin-i);
    }
    return array;
  };

  // Make sure ships don't overlap. Returns a boolean.
  Game.doShipsOverlap = function doShipsOverlap(proposedLocationsArray,shipIndex,fleet){
    let result = false;
    for (let i=0; i<shipIndex; i++){
      const shipLocation = fleet[i].location;
      for (let j=0; j<shipLocation.length; j++){
        if (proposedLocationsArray[proposedLocationsArray.length-1].includes(shipLocation[j])){
          result = true;
        }
      }
    }
    return result;
  };

  // Randomly select a feasible orientation for the ship's location and return the grid locations
  Game.setShipOrientation = function setShipOrientation(proposedLocationsArray){
    return proposedLocationsArray[Math.floor(Math.random()*proposedLocationsArray.length)];
  };

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

  Game.calcShipImgOrientation = function calcShipImgOrientation(shipLocation){
    if ((shipLocation[0]-shipLocation[1]) === 1) return 'left';
    if ((shipLocation[0]-shipLocation[1]) === -1) return 'right';
    if ((shipLocation[0]-shipLocation[1]) === Game.gridWidth) return 'up';
    if ((shipLocation[0]-shipLocation[1]) === -1*Game.gridWidth) return 'down';
  };

  Game.calcShipImgCoords = function calcShipImgCoords(shipLocation,direction){
    // If direction is left or up, the co-ords will be at the top left of shipLocation[last]
    if (direction === 'left' || direction === 'up') return Game.linearLocationToXAndYCoords(shipLocation[shipLocation.length-1]);
    // If direction is right or down, the co-ords will be at the top left of shipLocation[first]
    if (direction === 'right' || direction === 'down') return Game.linearLocationToXAndYCoords(shipLocation[0]);
  };

  Game.linearLocationToXAndYCoords = function linearLocationToXAndYCoords(location){
    // We're multiplying it by squareWidth as it's the factor for our grid
    const xCoord = (location%Game.gridWidth)*Game.squareWidth;
    const yCoord = (Math.floor(location/Game.gridWidth))*Game.squareWidth;
    return [xCoord,yCoord];
  };

  Game.calcShipImgRotation = function calcShipImgRotation(direction){
    if (direction === 'left') return '270deg';
    if (direction === 'right') return '90deg';
    if (direction === 'up') return '0deg';
    if (direction === 'down') return '180deg';
  };
  // This function has been created because the rotation results in the ship image being moved away from it's intended location
  // This function calculates the translation required to move it to where it needs to be
  Game.calcImgTranslation = function calcImgTranslation(direction,imgHeight,imgCoords){
    if (direction === 'left' || direction === 'right'){
      // Increase xCoord by (0.5*imgHeight - 0.5*squareWidth)
      imgCoords[0] += (0.5*parseFloat(imgHeight)-0.5*parseFloat(Game.squareWidth));
      // Decrease yCoord by (0.5*imgHeight - 0.5*squareWidth)
      imgCoords[1] -= (0.5*parseFloat(imgHeight)-0.5*parseFloat(Game.squareWidth));
    }
    return imgCoords;
  };
  //**********FUNCTIONS ABOVE HERE**********


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
        i--; // Since no locations are available, go through the loop again by decrementing i
      }
    } //End of for loop that cycles through ships
  } //End of for loop the cycles through the two players
}; // End of function placeShipsOnGrid

Game.messages = {
  alreadyBombed: 'You\'ve already bombed this location. Bomb another one.',
  playerHitsComputer: 'You hit your enemy\'s ',
  playerMissesComputer: 'You didn\'t hit any targets.',
  playerSinksComputer: 'You sank your enemy\'s ',
  playerDefeatsComputer: 'You sank your enemy\'s fleet',
  computerHitsPlayer: 'The enemy hit our ',
  computerMissesPlayer: 'The enemy missed us.',
  computerSinksPlayer: 'The enemy sank our ',
  computerDefeatsPlayer: 'The enemy sank our fleet'
};

Game.playerGuesses = { all: [], hits: [], player: 'human' };
Game.computerGuesses = { all: [], hits: [], player: 'computer' };
// This is where the gameplay starts
// Click on the tracking grid to guess where the computer's ships are located
function fireShot(){
  if (Game.gameOver) return;
  const squareId = $(this).index();
  if (Game.playerGuesses.all.includes(squareId)){
    $('.info-bar').text(Game.messages.alreadyBombed);
    return;
  }
  // gunShotSound();
  Game.playerGuesses.all.push(squareId);
  Game.$trackingSquareList.off('click', fireShot); // Turn player clicking off because it's the computer's turn
  checkHits(Game.playerGuesses,Game.shipObjects[1],squareId,this); // Cycle through enemy ships to see if you've made a hit

  // Making sure that if there's a hit, there's enough time to hear the sound if the sound effects are on
  if (Game.playerGuesses.all[Game.playerGuesses.all.length-1] === Game.playerGuesses.hits[Game.playerGuesses.hits.length-1] && !Game.sfxMuted){
    setTimeout(computerTurn, Game.compMoveTimeDelay+750);
  } else {
    setTimeout(computerTurn, Game.compMoveTimeDelay);
  }
}

function computerTurn(){
  let compGuess, guessingUsedSquares;
  do {
    compGuess = Math.floor(Math.random()*Math.pow(Game.gridWidth,2));
    guessingUsedSquares = (Game.computerGuesses.all.includes(compGuess)) ? true:false;
  } while (guessingUsedSquares);
  // gunShotSound();
  Game.computerGuesses.all.push(compGuess);
  const theSquareElement = $('.my-grid li')[compGuess]; // Using $('.my-grid li') here as $mySquareList becomes a ghost variable on game restart
  checkHits(Game.computerGuesses,Game.shipObjects[0],compGuess,theSquareElement);
  Game.$trackingSquareList.on('click', fireShot);// Turn player clicking back on
}

function sinkProcedure(attacker,unit,imgIdPrefix){
  const sinkMessage = (attacker === 'player') ? Game.messages.playerSinksComputer:Game.messages.computerSinksPlayer;
  $('.info-bar').text(sinkMessage + unit);
  // Change the location of the sunken ship to the one with the red crosses to show that it has been eliminated
  $(imgIdPrefix+unit+'-img').attr('src','sea-warfare-set/eliminated/'+unit+'-side.png');
}

function missProcedure(theSquareElement,classToAdd,missMessage){
  $(theSquareElement).removeClass('water').addClass(classToAdd);
  $('.info-bar').text(missMessage);
}

function checkHits(attackerGuessObject,fleetToHit,squareId,theSquareElement){
  let hitsThisTurn = 0;
  // Cycle through enemy ships to see if you've made a hit
  for (let i=0;i<fleetToHit.length;i++){
    if (fleetToHit[i].location.includes(squareId)){
      // hitSound();
      fleetToHit[i].hitLocation.push(squareId);
      attackerGuessObject.hits.push(squareId);
      // If 'the defender is someone' && 'this unit hasn't been hit in all spots'
      if (fleetToHit[0].player === 'computer' && fleetToHit[i].hitLocation.length!==fleetToHit[i].size){
        $('.info-bar').text(Game.messages.playerHitsComputer + fleetToHit[i].unit);
      } else if(fleetToHit[0].player === 'human' && fleetToHit[i].hitLocation.length!==fleetToHit[i].size) {
        $('.info-bar').text(Game.messages.computerHitsPlayer + fleetToHit[i].unit);
      }
      if (fleetToHit[0].player === 'computer'){
        $(theSquareElement).removeClass('water').addClass('tracking-squares-hit');
      } else {
        $(theSquareElement).append('<div class="my-squares-hit"></div>');
      }
      // Displaying further messages like 'sank ship', 'sank fleet', crossing out ship images etc
      if (fleetToHit[i].size === fleetToHit[i].hitLocation.length){
        // sinkSound();
        if (fleetToHit[0].player === 'computer'){
          sinkProcedure('player',fleetToHit[i].unit,'#player-');
        } else {
          sinkProcedure('computer',fleetToHit[i].unit,'#enemy-');
        }
        if (attackerGuessObject.hits.length === Game.hitsToWin){
          if (attackerGuessObject.player === 'human'){
            $('.info-bar').text(Game.messages.playerDefeatsComputer);
          } else {
            $('.info-bar').text(Game.messages.computerDefeatsPlayer);
          }
          Game.$trackingSquareList.off('click', fireShot);
          Game.gameOver = true;
        }
      }
      hitsThisTurn++;
      break;
    }
  }
  if (hitsThisTurn === 0 && fleetToHit[0].player === 'computer'){
    missProcedure(theSquareElement,'tracking-squares-missed',Game.messages.playerMissesComputer);
  } else if (hitsThisTurn === 0 && fleetToHit[0].player === 'human' && !Game.gameOver){
    missProcedure(theSquareElement,'my-squares-missed',Game.messages.computerMissesPlayer);
  }
} //End of function checkHits







Game.setup = function setup() {

  Game.createGrids();
  Game.createShips();
  Game.placeShipsOnGrid();
  Game.$trackingSquareList.on('click', fireShot);

};

$(Game.setup.bind(Game));
