$(()=>{

  const gridWidth = 10;
  const lettersForGridYAxis = ['A','B','C','D','E','F','G','H','I','J'];
  const playerGuesses = {
    all: [],
    hits: [],
    player: 'human'
  };
  const computerGuesses = {
    all: [],
    hits: [],
    player: 'computer'
  };
  const hitsToWin = 17;
  let gameOver = false;

  // Create ul's and li's to become the x and y-axis labels for the grids
  $('.player-column').append('<ul>'); // The x-axis number labels
  $('.player-column').append('<ul>'); // The y-axis letter labels
  $('.tracking-column').append('<ul>'); // The x-axis number labels
  $('.tracking-column').append('<ul>'); // The y-axis letter labels
  $('.player-column ul:nth-child(2)').addClass('grid-x-axis');
  $('.player-column ul:nth-child(3)').addClass('grid-y-axis');
  $('.tracking-column ul:nth-child(2)').addClass('grid-x-axis');
  $('.tracking-column ul:nth-child(3)').addClass('grid-y-axis');
  // Create the li elements for these 4 ul elements
  for (let i = 0; i < 10; i++) {
    $('.player-column .grid-x-axis').append('<li>');
    $('.player-column .grid-y-axis').append('<li>');
    $('.tracking-column .grid-x-axis').append('<li>');
    $('.tracking-column .grid-y-axis').append('<li>');
  }
  const $playerXAxisLabels = $('.player-column .grid-x-axis li');
  const $playerYAxisLabels = $('.player-column .grid-y-axis li');
  const $trackingXAxisLabels = $('.tracking-column .grid-x-axis li');
  const $trackingYAxisLabels = $('.tracking-column .grid-y-axis li');
  $playerXAxisLabels.addClass('grid-number-labels');
  $playerYAxisLabels.addClass('grid-letter-labels');
  $trackingXAxisLabels.addClass('grid-number-labels');
  $trackingYAxisLabels.addClass('grid-letter-labels');
  for (let i = 0; i < $playerXAxisLabels.length; i++) {
    $($playerXAxisLabels[i]).text(i+1);
    $($playerYAxisLabels[i]).text(lettersForGridYAxis[i]);
    $($trackingXAxisLabels[i]).text(i+1);
    $($trackingYAxisLabels[i]).text(lettersForGridYAxis[i]);
  }

  // Put 2 ul's in their respective columns to be the player's ship grid and the player's tracking grid
  $('.player-column').append('<ul>');
  $('.tracking-column').append('<ul>');
  // Add classes to the two grids
  // $('ul').first().addClass('grid my-grid');
  $('.player-column ul:nth-child(4)').addClass('grid my-grid');
  $('.tracking-column ul:nth-child(4)').addClass('grid tracking-grid');
  // Create the li elements for the two grids.
  // It's a 10x10 grid so 100 li elements(squares) for each grid
  for (let i=0; i<100; i++){
    $('.my-grid').append('<li>');
    $('.tracking-grid').append('<li>');
  }
  // Add classes to the squares in each grid
  const $mySquareList = $('.my-grid li');
  $mySquareList.addClass('squares my-squares water');
  const $trackingSquareList = $('.tracking-grid li');
  $trackingSquareList.addClass('squares tracking-squares water');

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
      // console.log('randomSpot:',randomSpot);

      // Check to see which orientations are feasible
      // The following if statements can be read as:
      // If this ship's size is less than or equal to the max size allowed in that orientation
      // Check if ship can be oriented upwards
      if (fleet[i].size <= Math.floor((randomSpot/gridWidth)+1)){
        proposedLocations.push(computeNorthAlignment(randomSpot,fleet[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i,fleet);
        if (overlapBoolean){
          proposedLocations.pop();
        }
      }
      // Check if ship can be oriented rightwards
      if (fleet[i].size <= gridWidth-(randomSpot%gridWidth)){
        proposedLocations.push(computeEastAlignment(randomSpot,fleet[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i,fleet);
        if (overlapBoolean){
          proposedLocations.pop();
        }
      }
      // Check if ship can be oriented downwards
      if (fleet[i].size <= gridWidth-Math.floor(randomSpot/gridWidth)){
        proposedLocations.push(computeSouthAlignment(randomSpot,fleet[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i,fleet);
        if (overlapBoolean){
          proposedLocations.pop();
        }
      }
      // Check if ship can be oriented leftwards
      if (fleet[i].size <= (randomSpot%gridWidth) +1){
        proposedLocations.push(computeWestAlignment(randomSpot,fleet[i].size));
        overlapBoolean = shipOverlaps(proposedLocations,i,fleet);
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
        // console.log(fleet[i].unit+' location:', fleet[i].location);
        // We only draw the ships for the human player and not the computer
        if (fleet[0].player === 'human'){
          drawShipOnGrid(fleet[i].location);
        }
        for (let i=0; i<proposedLocations.length; i++){
          proposedLocations.pop();
        }
      } else {
        // console.log('No locations available. Going through the loop again');
        // console.log('i:', i);
        i--;
      }
    } //End of for loop that cycles through ships
    // End of game setup


    //**********FUNCTIONS BELOW HERE**********

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
    function shipOverlaps(proposedLocationsArray,shipIndex,fleet){
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
        $($mySquareList[shipLocation[i]]).removeClass('water');
        $($mySquareList[shipLocation[i]]).addClass('my-ships');
      }
    }
  } //End of function placeShipsOnGrid

  // This is where the gameplay starts
  // Click on the tracking grid to guess where the computer's ships are located
  function checkHitsOnEnemy(){
    //console.log('Clicked '+ $(this).index());
    const squareId = $(this).index();
    if (playerGuesses.all.includes(squareId)){
      $('.info-bar').text('You\'ve already bombed this location. Bomb another one.')
      return;
    }
    playerGuesses.all.push(squareId);
    // Turn player clicking off because it's the computer's turn
    $trackingSquareList.off('click', checkHitsOnEnemy);
    // Cycle through enemy ships to see if you've made a hit
    checkHits(playerGuesses,enemyShips,squareId,this);
    // The computer makes their move next after a time lag
    setTimeout(computerTurn, 2000);
    // computerTurn();
  }
  $trackingSquareList.on('click', checkHitsOnEnemy);

  function computerTurn(){
    let compGuess;
    let guessingUsedSquares;

    do {
      compGuess = Math.floor(Math.random()*Math.pow(gridWidth,2));
      console.log('compGuess:', compGuess);
      if (computerGuesses.all.includes(compGuess)){
        console.log('Comp guessed a used square');
        guessingUsedSquares = true;
      } else {
        guessingUsedSquares = false;
      }
    } while (guessingUsedSquares);
    computerGuesses.all.push(compGuess);
    const theSquareElement = $mySquareList[compGuess];
    checkHits(computerGuesses,myShips,compGuess,theSquareElement);
    // Turn player clicking back on
    $trackingSquareList.on('click', checkHitsOnEnemy);
  }

  function checkHits(attackerGuessObject,fleetToHit,squareId,theSquareElement){
    let hitsThisTurn = 0;
    // Cycle through enemy ships to see if you've made a hit
    for (let i=0;i<fleetToHit.length;i++){
      if (fleetToHit[i].location.includes(squareId)){
        fleetToHit[i].hitLocation.push(squareId);
        attackerGuessObject.hits.push(squareId);
        if (fleetToHit[0].player === 'computer' && fleetToHit[i].hitLocation.length!==fleetToHit[i].size){
          $('.info-bar').text('You hit your enemy\'s ' + fleetToHit[i].unit);
        } else if(fleetToHit[0].player === 'human' && fleetToHit[i].hitLocation.length!==fleetToHit[i].size) {
          $('.info-bar').text('The enemy hit our ' + fleetToHit[i].unit);
        }
        if (fleetToHit[0].player === 'computer'){
          // $(theSquareElement).removeClass('tracking-squares');
          $(theSquareElement).addClass('tracking-squares-hit');
          $(theSquareElement).removeClass('water');
        } else {
          $(theSquareElement).addClass('my-squares-hit');
        }
        // Displaying further messages like 'sank ship', 'sank fleet',
        // crossing out ship images etc
        if (fleetToHit[i].size === fleetToHit[i].hitLocation.length){
          if (fleetToHit[0].player === 'computer'){
            $('.info-bar').text('You sank your enemy\'s ' + fleetToHit[i].unit +'!');
            // Change the location of the sunken ship to the one with the red crosses
            // to show that it has been eliminated
            const imgIdString = '#enemy-'+fleetToHit[i].unit+'-img';
            const imgLocationString = 'sea-warfare-set/eliminated/'+fleetToHit[i].unit+'-side.png';
            $(imgIdString).attr('src',imgLocationString);
          } else {
            $('.info-bar').text('The enemy sank our ' + fleetToHit[i].unit + '!');
            // Change the location of the sunken ship to the one with the red crosses
            // to show that it has been eliminated
            const imgIdString = '#player-'+fleetToHit[i].unit+'-img';
            const imgLocationString = 'sea-warfare-set/eliminated/'+fleetToHit[i].unit+'-side.png';
            $(imgIdString).attr('src',imgLocationString);
          }
          console.log('You sank '+ fleetToHit[0].player + '\'s ' + fleetToHit[i].unit);
          if (attackerGuessObject.hits.length === hitsToWin){
            if (attackerGuessObject.player === 'human'){
              $('.info-bar').text('Congratulations! You sank your enemy\'s fleet!');
              console.log('Congratulations! You sank your enemy\'s fleet!');
              $trackingSquareList.off('click', checkHitsOnEnemy);
              gameOver = true;
            } else {
              $('.info-bar').text('The enemy sank our fleet!');
              $trackingSquareList.off('click', checkHitsOnEnemy);
              gameOver = true;
            }
            console.log('Congratulations! You sank your enemy\'s fleet!');
            // if (fleetToHit[0].player === 'computer'){
            //   $trackingSquareList.off('click', checkHitsOnEnemy);
            // }
          }
        }
        hitsThisTurn++;
        break;
      }
    }
    if (hitsThisTurn === 0 && fleetToHit[0].player === 'computer'){
      // $(theSquareElement).removeClass('tracking-squares');
      $(theSquareElement).addClass('tracking-squares-missed');
      $(theSquareElement).removeClass('water');
      $('.info-bar').text('You didn\'t hit any targets');
    } else if (hitsThisTurn === 0 && fleetToHit[0].player === 'human' && !gameOver){
      $(theSquareElement).addClass('my-squares-missed');
      $(theSquareElement).removeClass('water');
      $('.info-bar').text('The computer missed you');
      console.log('The computer missed you');
    }
  }

  createShips();
  placeShipsOnGrid(myShips);
  placeShipsOnGrid(enemyShips);

});
