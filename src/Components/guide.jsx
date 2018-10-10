import React, { Component } from "react";

class Guide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text,
      step: undefined,
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  setText(text) {
    this.setState({
      text: text
    });
  }

  setStep(step) {
    this.setState({
      step: step
    });
  }

  getStep() {
    return this.state.step;
  }

  render() {
    return <p>{this.state.text}</p>;
  }
}

export default Guide;
