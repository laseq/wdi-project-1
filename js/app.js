$(()=>{

  // Put 2 ul's in body to be the player's grid and the player's hit grid
  $('body').append('<ul>');
  $('body').append('<ul>');
  let $myGrid = $('ul')[0];
  let $hitGrid = $('ul')[1];
  // Add classes to the two grids
  $('ul').first().addClass('grid my-grid');
  $('ul:nth-of-type(2)').addClass('grid hit-grid');
  console.log($myGrid);
  console.log($hitGrid);
  // Create the li elements for the two grids.
  // It's a 10x10 grid so 100 li elements(squares) for each grid
  for (let i=0; i<100; i++){
    $('.my-grid').append('<li>');
    $('.hit-grid').append('<li>');
  }
  // Add classes to the squares in each grid
  let $mySquareList = $('.my-grid li');
  $mySquareList.addClass('squares my-squares');
  let $hitSquareList = $('.hit-grid li');
  $hitSquareList.addClass('squares hit-squares');

});
