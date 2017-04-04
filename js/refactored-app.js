var Game = Game || {};

Game.gridWidth = 10;
Game.squareWidth = 37; // Used for the ship images


Game.createGridAxes = function createGridAxes() {
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
  $('.my-grid li').addClass('squares my-squares water');
  $('.tracking-grid li').addClass('squares tracking-squares water');
}; // End of function Game.createGridAxes




Game.setup = function setup() {

  Game.createGridAxes();

};

$(Game.setup.bind(Game));
