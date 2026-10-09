import { useState } from "react";
import "./App.css";


//Creates one square on the board
function Square({ value, onSquareClick, isWinningSquare }) {

  //Gives winning squares a different class
  const squareClass = isWinningSquare
    ? "square winning-square"
    : "square";

  return (
    <button
      className={squareClass}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}


//Creates the Tic-Tac-Toe board
function Board({ xIsNext, squares, onPlay }) {

  //Checks if somebody has won
  const winnerInfo = calculateWinner(squares);


  //Handles a square being clicked
  function handleClick(i) {

    //Stops the move if the square is filled
    //or somebody already won
    if (squares[i] || winnerInfo) {
      return;
    }


    //Makes a copy of the board
    const nextSquares = squares.slice();


    //Places X or O
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }


    //Finds the row and column of the move
    const row = Math.floor(i / 3) + 1;
    const col = (i % 3) + 1;


    //Sends the new board and location back to App
    onPlay(nextSquares, {
      row: row,
      col: col
    });
  }


  //Creates the message above the board
  let status;

  if (winnerInfo) {

    status = "Winner: " + winnerInfo.winner;

  } else if (isDraw(squares)) {

    status = "Draw! Nobody won.";

  } else {

    status = "Next player: " + (xIsNext ? "X" : "O");
  }


  //Stores all the board rows
  let rows = [];


  //First loop creates each row
  for (let row = 0; row < 3; row++) {

    //Stores the squares for this row
    let rowSquares = [];


    //Second loop creates each square
    for (let col = 0; col < 3; col++) {

      //Converts row and column into an array index
      const index = row * 3 + col;


      //Starts as a normal square
      let isWinningSquare = false;


      //Checks if this square is part of the winning line
      if (winnerInfo) {

        for (let i = 0; i < winnerInfo.line.length; i++) {

          if (winnerInfo.line[i] === index) {
            isWinningSquare = true;
          }
        }
      }


      //Adds the square using a copied array
      rowSquares = [
        ...rowSquares,

        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          isWinningSquare={isWinningSquare}
        />
      ];
    }


    //Adds the completed row using a copied array
    rows = [
      ...rows,

      <div
        className="board-row"
        key={row}
      >
        {rowSquares}
      </div>
    ];
  }


  return (
    <div className="board-section">

      <div className="status">
        {status}
      </div>

      <div className="board">
        {rows}
      </div>

    </div>
  );
}


//Main React component
export default function App() {

  //Stores every version of the board
  const [history, setHistory] = useState([
    {
      squares: Array(9).fill(null),
      location: null
    }
  ]);


  //Stores which move is currently being viewed
  const [currentMove, setCurrentMove] = useState(0);


  //Stores the order of the move history
  const [ascending, setAscending] = useState(true);


  //X plays on even moves
  const xIsNext = currentMove % 2 === 0;


  //Gets the board for the current move
  const currentSquares =
    history[currentMove].squares;


  //Adds a new move to the history
  function handlePlay(nextSquares, location) {

    //Creates a new history without changing the old one
    const nextHistory = [
      ...history.slice(0, currentMove + 1),

      {
        squares: nextSquares.slice(),

        location: {
          ...location
        }
      }
    ];


    //Updates the history
    setHistory(nextHistory);


    //Moves to the newest move
    setCurrentMove(nextHistory.length - 1);
  }


  //Goes to another move in history
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }


  //Changes between ascending and descending
  function toggleSort() {
    setAscending(!ascending);
  }


  //Creates the move history
  const moves = history.map((historyItem, move) => {

    let description;


    //Creates the description for each move
    if (move > 0) {

      description =
        "Go to move #" +
        move +
        " (" +
        historyItem.location.row +
        ", " +
        historyItem.location.col +
        ")";

    } else {

      description = "Go to game start";
    }


    //Current move is text instead of a button
    if (move === currentMove) {

      return (
        <li key={move}>

          <span className="current-move">

            You are at move #{move}

            {move > 0
              ? " (" +
                historyItem.location.row +
                ", " +
                historyItem.location.col +
                ")"
              : ""}

          </span>

        </li>
      );
    }


    //All other moves are buttons
    return (
      <li key={move}>

        <button
          className="history-button"
          onClick={() => jumpTo(move)}
        >
          {description}
        </button>

      </li>
    );
  });


  //Makes a copy before reversing
  const displayedMoves = ascending
    ? moves
    : moves.slice().reverse();


  return (
    <main className="page">

      <h1>Tic-Tac-Toe</h1>

      <p className="intro">
        Play Tic-Tac-Toe and use the move history
        to go backward and forward through the game.
      </p>


      <div className="game">

        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
        />


        <div className="game-info">

          <h2>Move History</h2>


          <button
            className="sort-button"
            onClick={toggleSort}
          >
            Sort {ascending
              ? "Descending"
              : "Ascending"}
          </button>


          <ol>
            {displayedMoves}
          </ol>

        </div>

      </div>

    </main>
  );
}


//Checks if somebody won
function calculateWinner(squares) {

  //Every possible winning combination
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];


  //Checks each winning combination
  for (let i = 0; i < lines.length; i++) {

    const [a, b, c] = lines[i];


    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {

      //Returns the winner and a copy of the winning line
      return {
        winner: squares[a],
        line: lines[i].slice()
      };
    }
  }


  //Nobody has won
  return null;
}


//Checks if the game ended in a draw
function isDraw(squares) {

  //A winner means it is not a draw
  if (calculateWinner(squares)) {
    return false;
  }


  //Looks for an empty square
  for (let i = 0; i < squares.length; i++) {

    if (squares[i] === null) {
      return false;
    }
  }


  //Every square is filled and nobody won
  return true;
}