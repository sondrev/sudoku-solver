import React, { Component } from "react";
import "./style.css";
import SudokuSolver from "./Components/sudokuSolver";

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Sudoku Solver</h1>
        <SudokuSolver />
      </div>
    );
  }
}

export default App;
