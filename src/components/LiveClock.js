import React, { Component } from "react";

class LiveClock extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString("en-CA"), // Forces YYYY-MM-DD format
    };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    const now = new Date();
    this.setState({
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString("en-CA"),
    });
  }

  formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  render() {
    return (
      <div>
        <h2 className="font-mono font-bold text-2xl font-primary">
          {this.state.time}
        </h2>
        <p className="font-semibold text-xs">{this.state.date}</p>
      </div>
    );
  }
}

export default LiveClock;
