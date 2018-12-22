import React, { Component } from "react";
import Board from "./board";
import Guide from "./guide";

/*
Glossary from: https://en.wikipedia.org/wiki/Glossary_of_Sudoku
*/


const startingValues = [
    [0, 0, 1, 0, 0, 0, 0, 0, 0],
    [3, 0, 7, 6, 0, 5, 1, 0, 9],
    [0, 5, 0, 0, 1, 0, 0, 8, 0],
    [0, 7, 0, 4, 0, 3, 0, 1, 0],
    [0, 0, 9, 0, 0, 0, 5, 0, 0],
    [0, 1, 0, 9, 0, 8, 0, 7, 0],
    [0, 4, 0, 0, 2, 0, 0, 6, 0],
    [1, 0, 8, 5, 0, 6, 3, 0, 7],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
];

let haveFilledAllCandidates = false;

class SudokuSolver extends Component {
    solveOneStep() {
        if (this.board.getAllUnsolvedCells().length === 0) {
            this.board.clearHighlights();
            this.setGuideText("Finished!");
            return false;
        } else if (!haveFilledAllCandidates) {
            this.fillCandidates();
            this.setGuideText("Let's fill each empty cell with all valid values");
            haveFilledAllCandidates = true;
            return true;
        } else {
            if (this.guide.getStep()) {
                const step = this.guide.getStep();
                if (step.action === "set") {
                    this.setSolution(step.cell, step.value);
                }
                if (step.action === "removeCandidates") {
                    step.cells.forEach(cell => cell.removeCandidates(step.values));
                }
                this.guide.setStep(undefined);
                return true;
            } else {
                this.board.clearHighlights();
                if (this.findSingle() || this.findHiddenSingle() || this.findNakedPair() || this.findXWing()) {
                    return true;
                } else {
                    this.setGuideText("Stuck. Cant solve this Soduko");

                    return false;
                }
            }

        }
    }



    async solveAll() {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        while (this.solveOneStep()) {
            await sleep(10); //A short sleep for the visual effect
        }
    }

    fillCandidates() {
        this.board.getAllUnsolvedCells().forEach(cell => {
            let related = this.board.getRelatedCells(cell);
            let validValues = [];
            for (let i = 1; i < 10; i++) {
                if (related.every(otherCell => otherCell.getValue() !== i))
                    validValues.push(i);
            }
            cell.setCandidates(validValues);
        });
    }

    findSingle() {
        return this.board.getAllUnsolvedCells().some(cell => {
            if (cell.getCandidates().length === 1) {
                cell.setHighlightImportant();
                this.setGuideText("Single: This cell has only one candidate and must be " + cell.getCandidates()[0])
                this.setGuideStep({ action: "set", cell: cell, value: cell.getCandidates()[0] })
                return true;
            }
        });
    }

    findHiddenSingle() {
        let board = this.board;
        return this.board.getAllUnsolvedCells().some(cell => {
            return cell.getCandidates().some(candidate => {
                if (
                    board
                        .getCellsFromSection(cell.getSection())
                        .filter(otherCell => otherCell.getCandidates().includes(candidate)
                        ).length === 1
                ) {
                    board.highlightGroup(board.getCellsFromSection(cell.getSection()));
                    cell.setHighlightImportant();
                    this.setGuideText("Hidden single: This is the only cell in this section that can be " + candidate);
                    this.setGuideStep({ action: "set", cell: cell, value: candidate })
                    return true;
                } else if (
                    board
                        .getCellsFromCol(cell.getCol())
                        .filter(otherCell => otherCell.getCandidates().includes(candidate)
                        ).length === 1
                ) {
                    board.highlightGroup(board.getCellsFromCol(cell.getCol()));
                    cell.setHighlightImportant();
                    this.setGuideText("Hidden single: This is the only cell in this coloumn that can be " + candidate);
                    this.setGuideStep({ action: "set", cell: cell, value: candidate })
                    return true;
                } else if (
                    board
                        .getCellsFromRow(cell.getRow())
                        .filter(otherCell => otherCell.getCandidates().includes(candidate)
                        ).length === 1
                ) {
                    board.highlightGroup(board.getCellsFromRow(cell.getRow()));
                    cell.setHighlightImportant();
                    this.setGuideText("Hidden single: This is the only cell in this row that can be " + candidate);
                    this.setGuideStep({ action: "set", cell: cell, value: candidate })
                    return true;
                }
            });
        });
    }


    findNakedPairInGroup(group) {
        const board = this.board;
        return group.filter(cell => cell.isUnsolved()).some(cell => {
            let matches = group.filter(otherCell => { return cell.sameCandidadates(otherCell) })
            if (matches.length === 2 && cell.getCandidates().length === 2) {
                const otherCells = group.filter(
                    otherCell => !cell.sameCandidadates(otherCell)
                );
                const affectedCells = otherCells.filter(otherCell =>
                    otherCell.sharesSomeCandidadtes(cell)
                );
                if (affectedCells.length) {
                    board.highlightGroup(group);
                    matches[0].setHighlightImportant();
                    matches[1].setHighlightImportant();
                    const candA = cell.getCandidates()[0];
                    const candB = cell.getCandidates()[1];
                    this.setGuideText("Naked Pair: Theese two cells have the exact same two candidates ("
                        + candA + "," + candB
                        + "). If one of them is " + candA + " then the other must be " + candB +
                        " and Vice Versa. Therefore no other cell in this group can be either of these values ")
                    this.setGuideStep({ action: "removeCandidates", cells: affectedCells, values: cell.getCandidates() })
                    return true;
                }
            }
            return false;
        });
    }

    findNakedPair() {
        for (let i = 0; i < 9; i++) {
            let section = this.board.getCellsFromSection(i);
            let col = this.board.getCellsFromCol(i);
            let row = this.board.getCellsFromRow(i);
            if (this.findNakedPairInGroup(section)) return true;
            if (this.findNakedPairInGroup(col)) return true;
            if (this.findNakedPairInGroup(row)) return true;
        }
        return false;
    }

    findXWing() {
        const board = this.board;
        for (let i = 1; i < 10; i++) {
            for (let row1 = 0; row1 < 9; row1++) {
                for (let row2 = row1 + 1; row2 < 9; row2++) {
                    for (let col1 = 0; col1 < 9; col1++) {
                        for (let col2 = col1 + 1; col2 < 9; col2++) {
                            const row1Matches = board
                                .getCellsFromRow(row1)
                                .filter(otherCell => otherCell.hasCandidate(i)).length;
                            const row2Matches = board
                                .getCellsFromRow(row2)
                                .filter(otherCell => otherCell.hasCandidate(i)).length;
                            if (
                                row1Matches === 2 && row2Matches === 2 &&
                                this.board.getCellAt(col1, row1).hasCandidate(i) &&
                                this.board.getCellAt(col2, row1).hasCandidate(i) &&
                                this.board.getCellAt(col1, row2).hasCandidate(i) &&
                                this.board.getCellAt(col2, row2).hasCandidate(i)
                            ) {
                                const affectedCells = [
                                    ...this.board.getCellsFromCol(col1),
                                    ...this.board.getCellsFromCol(col2)
                                ].filter(cell => cell.getRow() !== row1 && cell.getRow() !== row2 && cell.hasCandidate(i));
                                if (affectedCells.length) {
                                    this.board.highlightGroup(this.board.getCellsFromCol(col1));
                                    this.board.highlightGroup(this.board.getCellsFromCol(col2));
                                    this.board.highlightGroup(this.board.getCellsFromRow(row1));
                                    this.board.highlightGroup(this.board.getCellsFromRow(row2));
                                    this.board.getCellAt(col1, row1).setHighlightImportant();
                                    this.board.getCellAt(col1, row2).setHighlightImportant();
                                    this.board.getCellAt(col2, row1).setHighlightImportant();
                                    this.board.getCellAt(col2, row2).setHighlightImportant();
                                    this.setGuideText("X-Wing: Two rows have the same candidate (" + i + ") appearing twice, and in the same coloumns"
                                        + ". The candidate can only appear in upper left + lower right OR upper right + lower left. In both cases the candidate will appear "
                                        + "in both coloumns and we can remove " + i + " as a candidate from other cells in both coloumns")
                                    this.setGuideStep({ action: "removeCandidates", cells: affectedCells, values: [i] })
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }


    setSolution(cell, solution) {
        cell.setSolution(solution);
        this.board.getRelatedCells(cell).forEach(otherCell => otherCell.removeCandidate(solution));
    }

    setGuideText(text) {
        this.guide.setText(text);
    }

    setGuideStep(step) {
        this.guide.setStep(step);
    }

    reset() {
        this.board.resetValues(startingValues);
        haveFilledAllCandidates=false;
    }

    render() {
        return (
            <div>
                <Board onRef={ref => (this.board = ref)} values={startingValues} />
                <button onClick={() => this.reset()}>Reset</button>
                <button onClick={() => this.solveOneStep()}>Next step</button>
                <button onClick={() => this.solveAll()}>Solve All</button>
                <Guide
                    onRef={ref => (this.guide = ref)}
                    text={"To start please use the buttons above"}
                />
            </div>
        );
    }
}

export default SudokuSolver