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
  // console.log($myGrid);
  // console.log($trackingGrid);
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
  function ship(unit){
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
  }

  const myShips = [];
  const enemyShips = [];

  function createShips(){
    myShips[0] = new ship('carrier');
    myShips[1] = new ship('battleship');
    myShips[2] = new ship('cruiser');
    myShips[3] = new ship('submarine');
    myShips[4] = new ship('destroyer');
    enemyShips[0] = new ship('carrier');
    enemyShips[1] = new ship('battleship');
    enemyShips[2] = new ship('cruiser');
    enemyShips[3] = new ship('submarine');
    enemyShips[4] = new ship('destroyer');
  }

  // Object to store direction feasibility
  function directionFeasibility() {
    this.north = false;
    this.west = false;
    this.south = false;
    this.east = false;
  }

  function placeShipsOnGrid(){
    // We're cycling through each ship from carrier to destroyer here
    for (let i=0; i<myShips.length; i++){
      const proposedLocations = [];
      let overlapBoolean;
      // Select a random proposed spot to start placing a ship
      const randomSpot = Math.floor(Math.random()*Math.pow(gridWidth,2));
      console.log('randomSpot:',randomSpot);
      // Check to see which orientations are feasible
      // The following if statements can be read as:
      // If this ship's size is less than or equal to the max size allowed in that orientation
      // Check if ship can be oriented upwards
      if (myShips[i].size <= Math.floor((randomSpot/gridWidth)+1)){
        proposedLocations.push(computeNorthAlignment(randomSpot,myShips[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i);
        if (overlapBoolean){
          proposedLocations.pop();
          directionFeasibility.north = false;
        } else {
          directionFeasibility.north = true;
        }
        // console.log('shipoverlaps:',overlapBoolean);
      } else {
        directionFeasibility.north = false;
      }
      // Check if ship can be oriented rightwards
      if (myShips[i].size <= gridWidth-(randomSpot%gridWidth)){
        proposedLocations.push(computeEastAlignment(randomSpot,myShips[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i);
        if (overlapBoolean){
          proposedLocations.pop();
          directionFeasibility.east = false;
        } else {
          directionFeasibility.east = true;
        }
        // console.log('shipoverlaps:',overlapBoolean);
      } else {
        directionFeasibility.east = false;
      }
      // Check if ship can be oriented downwards
      if (myShips[i].size <= gridWidth-Math.floor(randomSpot/gridWidth)){
        proposedLocations.push(computeSouthAlignment(randomSpot,myShips[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i);
        if (overlapBoolean){
          proposedLocations.pop();
          directionFeasibility.south = false;
        } else {
          directionFeasibility.south = true;
        }
        // console.log('shipoverlaps:',overlapBoolean);
      } else {
        directionFeasibility.south = false;
      }
      // Check if ship can be oriented leftwards
      if (myShips[i].size <= (randomSpot%gridWidth) +1){
        proposedLocations.push(computeWestAlignment(randomSpot,myShips[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i);
        if (overlapBoolean){
          proposedLocations.pop();
          directionFeasibility.west = false;
        } else {
          directionFeasibility.west = true;
        }
        // console.log('shipoverlaps:',overlapBoolean);
      } else {
        directionFeasibility.west = false;
      }

      // If there are proposed locations for the ship to be put in,
      // set the ship's location and draw it on the grid
      // Else, decrement i so that the ship can get a new random spot
      // when it goes through the for loop again
      if (proposedLocations.length > 0){
        myShips[i].location = setShipOrientation(proposedLocations);
        console.log(myShips[i].unit+' location:', myShips[i].location);
        drawShipOnGrid(myShips[i].location);
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
      // console.log('North Alignment:', array);
      return array;
    }
    function computeEastAlignment(origin,size){
      const array = [];
      array.push(origin);
      for (let i=1; i<size; i++){
        array.push(origin+i);
      }
      // console.log('East Alignment:', array);
      return array;
    }
    function computeSouthAlignment(origin,size){
      const array = [];
      for (let i=0; i<size; i++){
        array.push(origin+i*gridWidth);
      }
      // console.log('South Alignment:', array);
      return array;
    }
    function computeWestAlignment(origin,size){
      const array = [];
      array.push(origin);
      for (let i=1; i<size; i++){
        array.push(origin-i);
      }
      // console.log('West Alignment:', array);
      return array;
    }

    // Make sure ships don't overlap
    // We have myShips[i].location and the proposedLocations[i] to work with
    function shipOverlaps(proposedLocationsArray,shipIndex){
      let result = false;
      for (let i=0; i<shipIndex; i++){
        // console.log('Entered function shipOverlaps');
        // console.log('proposedLocationsArray: ', proposedLocationsArray);
        // console.log('i:',i,'shipIndex:',shipIndex);
        const shipLocation = myShips[i].location;
        // console.log('shipLocation', shipLocation);
        // console.log('shipLocation.length:',shipLocation.length);
        for (let j=0; j<shipLocation.length; j++){
          // console.log('j:',j);
          // console.log('shipLocation.length',shipLocation.length);
          if (proposedLocationsArray[proposedLocationsArray.length-1].includes(shipLocation[j])){
            // console.log('Ships are overlapping');
            // console.log('shipLocation: ', shipLocation);
            // console.log('proposedLocationsArray[proposedLocationsArray.length-1]: ', proposedLocationsArray[proposedLocationsArray.length-1]);
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
  placeShipsOnGrid();


});
