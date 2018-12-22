import React, { Component } from "react";
import Cell from "./cell";

class Board extends Component {
  constructor(props) {
    super(props);
    this.cellRefs = [];
    this.state = {
      cellComponents: this.props.values.map((row, rowIndex) =>
        row.map((value, index) => (
          <Cell
            value={value}
            x={index}
            y={rowIndex}
            onRef={ref => this.cellRefs.push(ref)}
          />
        ))
      )
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  resetValues(values) {
    values.forEach((row, rowIndex) =>
    row.forEach((value, index) => {
      this.getCellAt(index,rowIndex).setSolution(value)
      this.getCellAt(index,rowIndex).setCandidates([])
      this.getCellAt(index,rowIndex).clearHighlight()
    }
    ))
  }

  getCellAt(col, row) {
    return this.cellRefs[col + row * 9];
  }

  getAllCells() {
    return this.cellRefs;
  }

  getAllUnsolvedCells() {
    return this.getAllCells().filter(c => c.getValue() === 0);
  }

  getCellsFromCol(col) {
    return this.getAllCells().filter(c => c.getCol() === col);
  }

  getCellsFromRow(row) {
    return this.getAllCells().filter(c => c.getRow() === row);
  }

  getCellsFromSection(section) {
    return this.getAllCells().filter(c => c.getSection() === section);
  }

  getRelatedCells(cell) {
    //All cells related: same row, col, and section
    const allCells = [
      ...this.getCellsFromCol(cell.getCol()),
      ...this.getCellsFromRow(cell.getRow()),
      ...this.getCellsFromSection(cell.getSection())
    ];
    //Remove duplicates, and reference-cell
    let relatedCells = allCells.filter(
      (el, i, a) => i === a.indexOf(el) && cell !== el
    );

    return relatedCells;
  }

  highlightGroup(group) {
    group.forEach(cell => cell.setHighlight());
  }

  clearHighlights() {
    this.getAllCells().forEach(cell => cell.clearHighlight());
  }

  render() {
    return (
      <table>
        <tbody>{this.state.cellComponents.map(row => <tr>{row}</tr>)}</tbody>
      </table>
    );
  }
}

export default Board;
