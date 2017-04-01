$(()=>{

  const gridWidth = 10;

  // Put 2 ul's in body to be the player's grid and the player's tracking grid
  $('body').append('<ul>');
  $('body').append('<ul>');
  const $myGrid = $('ul')[0];
  const $trackingGrid = $('ul')[1];
  // Add classes to the two grids
  $('ul').first().addClass('grid my-grid');
  $('ul:nth-of-type(2)').addClass('grid tracking-grid');
  // Create the li elements for the two grids.
  // It's a 10x10 grid so 100 li elements(squares) for each grid
  for (let i=0; i<100; i++){
    $('.my-grid').append('<li>');
    $('.tracking-grid').append('<li>');
  }
  // Add classes to the squares in each grid
  const $mySquareList = $('.my-grid li');
  $mySquareList.addClass('squares my-squares');
  const $trackingSquareList = $('.tracking-grid li');
  $trackingSquareList.addClass('squares tracking-squares');

  // Create a ship constructor
  function ship(unit,player){
    this.unit = unit;
    switch (unit) {
      case 'carrier':
        this.size = 5;
        break;
      case 'battleship':
        this.size = 4;
        break;
      case 'cruiser':
        this.size = 3;
        break;
      case 'submarine':
        this.size = 3;
        break;
      case 'destroyer':
        this.size = 2;
        break;
    }
    this.location = [];
    this.hitLocation = [];
    this.player = player;
  }

  const myShips = [];
  const enemyShips = [];

  function createShips(){
    myShips[0] = new ship('carrier','human');
    myShips[1] = new ship('battleship','human');
    myShips[2] = new ship('cruiser','human');
    myShips[3] = new ship('submarine','human');
    myShips[4] = new ship('destroyer','human');
    enemyShips[0] = new ship('carrier','computer');
    enemyShips[1] = new ship('battleship','computer');
    enemyShips[2] = new ship('cruiser','computer');
    enemyShips[3] = new ship('submarine','computer');
    enemyShips[4] = new ship('destroyer','computer');
  }

  function placeShipsOnGrid(fleet){
    // We're cycling through each ship from carrier to destroyer here
    for (let i=0; i<fleet.length; i++){
      const proposedLocations = [];
      let overlapBoolean; // Used for checking whether ships overlap each other
      // Select a random proposed spot to start placing a ship
      const randomSpot = Math.floor(Math.random()*Math.pow(gridWidth,2));
      console.log('randomSpot:',randomSpot);
      // Check to see which orientations are feasible
      // The following if statements can be read as:
      // If this ship's size is less than or equal to the max size allowed in that orientation
      // Check if ship can be oriented upwards
      if (fleet[i].size <= Math.floor((randomSpot/gridWidth)+1)){
        proposedLocations.push(computeNorthAlignment(randomSpot,fleet[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i);
        if (overlapBoolean){
          proposedLocations.pop();
        }
      }
      // Check if ship can be oriented rightwards
      if (fleet[i].size <= gridWidth-(randomSpot%gridWidth)){
        proposedLocations.push(computeEastAlignment(randomSpot,fleet[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i);
        if (overlapBoolean){
          proposedLocations.pop();
        }
      }
      // Check if ship can be oriented downwards
      if (fleet[i].size <= gridWidth-Math.floor(randomSpot/gridWidth)){
        proposedLocations.push(computeSouthAlignment(randomSpot,fleet[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i);
        if (overlapBoolean){
          proposedLocations.pop();
        }
      }
      // Check if ship can be oriented leftwards
      if (fleet[i].size <= (randomSpot%gridWidth) +1){
        proposedLocations.push(computeWestAlignment(randomSpot,fleet[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i);
        if (overlapBoolean){
          proposedLocations.pop();
        }
      }

      // If there are proposed locations for the ship to be put in,
      // set the ship's location and draw it on the grid
      // Else, decrement i so that the ship can get a new random spot
      // when it goes through the for loop again
      if (proposedLocations.length > 0){
        fleet[i].location = setShipOrientation(proposedLocations);
        console.log(fleet[i].unit+' location:', fleet[i].location);
        // We only draw the ships for the human player and not the computer
        if (fleet[0].player === 'human'){
          drawShipOnGrid(fleet[i].location);
        }
        for (let i=0; i<proposedLocations.length; i++){
          proposedLocations.pop();
        }
      } else {
        console.log('No locations available. Going through the loop again');
        console.log('i:', i);
        i--;
      }
    } //End of for loop that cycles through ships








    // Check to see if we can place the ship upwards
    function computeNorthAlignment(origin,size){
      const array = [];
      for (let i=0; i<size; i++){
        array.push(origin-i*gridWidth);
      }
      return array;
    }
    // Check to see if we can place the ship rightwards
    function computeEastAlignment(origin,size){
      const array = [];
      array.push(origin);
      for (let i=1; i<size; i++){
        array.push(origin+i);
      }
      return array;
    }
    // Check to see if we can place the ship downwards
    function computeSouthAlignment(origin,size){
      const array = [];
      for (let i=0; i<size; i++){
        array.push(origin+i*gridWidth);
      }
      return array;
    }
    // Check to see if we can place the ship leftwards
    function computeWestAlignment(origin,size){
      const array = [];
      array.push(origin);
      for (let i=1; i<size; i++){
        array.push(origin-i);
      }
      return array;
    }

    // Make sure ships don't overlap
    function shipOverlaps(proposedLocationsArray,shipIndex){
      let result = false;
      for (let i=0; i<shipIndex; i++){
        const shipLocation = myShips[i].location;
        for (let j=0; j<shipLocation.length; j++){
          if (proposedLocationsArray[proposedLocationsArray.length-1].includes(shipLocation[j])){
            result = true;
          }
        }
      }
      return result;
    }

    // Randomly select a feasible orientation for the ship's location
    // and return the grid locations
    function setShipOrientation(proposedLocationsArray){
      const randomArraySlot = Math.floor(Math.random()*proposedLocationsArray.length);
      return proposedLocationsArray[randomArraySlot];
    }

    // Draw the ships on the player's grid
    function drawShipOnGrid(shipLocation){
      for (let i = 0; i < shipLocation.length; i++) {
        $($mySquareList[shipLocation[i]]).addClass('my-ships');
      }
    }

  }

  createShips();
  placeShipsOnGrid(myShips);
  placeShipsOnGrid(enemyShips);


});
