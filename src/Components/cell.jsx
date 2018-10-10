import React, { Component } from "react";

class Cell extends Component {
  constructor(props) {
    super(props);
    const sectionX = this.props.x % 3;
    const sectionY = this.props.y % 3;
    let borderClass = "";
    if (sectionX === 0) borderClass += "left ";
    if (sectionX === 2) borderClass += "right ";
    if (sectionY === 0) borderClass += "top ";
    if (sectionY === 2) borderClass += "bottom ";

    this.state = {
      value: this.props.value,
      highlight: "",
      candidates: [],
      sectionX: this.props.x % 3,
      sectionY: this.props.y % 3,
      row: this.props.y,
      col: this.props.x,
      section: Math.floor(this.props.x / 3) + Math.floor(this.props.y / 3) * 3,
      borderClass: borderClass
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  setCandidates(candidates) {
    this.setState({ candidates: candidates });
  }

  removeCandidates(candidates) {
    this.setState({
      candidates: this.state.candidates.filter(
        value => !candidates.includes(value)
      )
    });
  }

  removeCandidate(candidate) {
    this.setState({
      candidates: this.state.candidates.filter(value => value !== candidate)
    });
  }

  hasCandidate(candidate) {
    return this.getCandidates().includes(candidate);
  }

  sameCandidadates(otherCell) {
    return (
      this.getCandidates().toString() === otherCell.getCandidates().toString()
    );
  }

  sharesSomeCandidadtes(otherCell) {
    return this.getCandidates().some(value =>
      otherCell.getCandidates().includes(value)
    );
  }

  getValue() {
    return this.state.value;
  }

  isUnsolved() {
    return this.state.value === 0;
  }

  setSolution(value) {
    this.setState({ value: value, candidates: [] });
  }

  setHighlightImportant() {
    this.setState({ highlight: " highlight--yellow" });
  }

  setHighlight() {
    this.setState({ highlight: " highlight--yellow--dimmed" });
  }

  clearHighlight() {
    this.setState({ highlight: "" });
  }

  getCandidates() {
    return this.state.candidates;
  }

  getCol() {
    return this.state.col;
  }

  getRow() {
    return this.state.row;
  }

  getSection() {
    return this.state.section;
  }

  render() {
    if (this.state.value !== 0)
      return (
        <td className={this.state.borderClass + this.state.highlight}>
          {this.state.value}
        </td>
      );
    else if (this.state.candidates && this.state.candidates.length)
      return (
        <td
          className={
            this.state.borderClass + this.state.highlight + " font--small"
          }
        >
          {this.state.candidates.map(value => value + " ")}
        </td>
      );
    else
      return <td className={this.state.borderClass + this.state.highlight} />;
  }
}

export default Cell;
