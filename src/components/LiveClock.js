import React, { Component } from "react";

class LiveClock extends Component {
  constructor(props) {
    super(props);

    const now = new Date();
    this.state = {
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
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
      date: now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    });
  }

  formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  render() {
    return (
      <div>
        <h2 className="font-primary font-mono text-sm font-bold">
          {this.state.time}
        </h2>
        <p className="text-xs">{this.state.date}</p>
      </div>
    );
  }
}

export default LiveClock;
