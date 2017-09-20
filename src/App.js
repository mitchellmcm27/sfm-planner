import React, { Component } from "react";
import Line from "react-lineto";
import { colorInterpolation } from "color-interpolator";

import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      resolution: "0.03", // m/px
      overlap: "0.75",
      speed: "10", // m/s
      dx: "3000", // px
      dy: "4000", // px
      fov: "78.8" // degrees
    };
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  };

  render() {
    const droneHeight = (this.state.dy *
      this.state.resolution /
      2 /
      Math.tan(this.state.fov * Math.PI / 180 / 2)).toFixed(2);

    const height = this.state.dx * this.state.resolution;
    const width = this.state.dy * this.state.resolution;

    const frameInterval = (height *
      (1 - this.state.overlap) /
      this.state.speed).toFixed(2);

    const Js = [0, 1, 2, 3, 4, 5];
    const Is = [0, 1, 2, 3, 4, 5];

    return (
      <div style={{ height: "100%", width: "100%", padding: 12 }}>
        <form style={{ float: "left", width: "50%" }}>
          <label>
            Desired resolution:
            <input
              type="text"
              name="resolution"
              value={this.state.resolution}
              onChange={this.handleInputChange}
            />
            meters per pixel
          </label>
          <br />
          <label>
            Desired image overlap:
            <input
              type="text"
              name="overlap"
              value={this.state.overlap}
              onChange={this.handleInputChange}
            />
            percent
          </label>
          <br />
          <label>
            Drone speed:
            <input
              type="text"
              name="speed"
              value={this.state.speed}
              onChange={this.handleInputChange}
            />
            meters per second
          </label>
          <br />
          <label>
            Image dimension (x):
            <input
              type="text"
              name="dx"
              value={this.state.dx}
              onChange={this.handleInputChange}
            />
            pixels
          </label>
          <br />
          <label>
            Image dimension (y):
            <input
              type="text"
              name="dy"
              value={this.state.dy}
              onChange={this.handleInputChange}
            />
            pixels
          </label>
          <br />
          <label>
            Camera field of view:
            <input
              type="text"
              name="fov"
              value={this.state.fov}
              onChange={this.handleInputChange}
            />
            degrees
          </label>
          <h3>
            {isNaN(droneHeight) ? (
              "Check input"
            ) : (
              `Drone height: ${droneHeight} meters`
            )}
          </h3>

          <h3>
            {isNaN(frameInterval) ? (
              "Check input"
            ) : (
              `Photo interval: ${frameInterval} seconds`
            )}
          </h3>
        </form>

        <div style={{ float: "left", width: "50%", position: "relative" }}>
          <Line
            x0={width / 2}
            y0={0}
            x1={0}
            y1={droneHeight}
            border="1px solid red"
          />
          <Line
            x0={width / 2}
            y0={0}
            x1={width}
            y1={droneHeight}
            border="1px solid red"
          />
          {Js.map(j => {
            return Is.map(i => {
              const even = j % 2 === 0;
              const t = (j + i) / (Js[Js.length - 1] + Is[Is.length - 1]);
              const color = colorInterpolation("#ff0000", "#0000ff", t);
              const last = j == Js[Js.length - 1] && i == Is[Is.length - 1];
              return (
                <div>
                  <div
                    className={"A" + i + j}
                    style={{
                      position: "absolute",
                      top: height * (1 - this.state.overlap) * i,
                      left: width * (1 - this.state.overlap) * j,
                      width: width,
                      height: height,
                      background: color,
                      opacity: 0.15
                    }}
                  />
                  {last && (
                    <div
                      className={"A" + i + j}
                      style={{
                        position: "absolute",
                        top: height * (1 - this.state.overlap) * i,
                        left: width * (1 - this.state.overlap) * j,
                        width: width,
                        height: height,
                        border: "2px solid black",
                        opacity: 0.5
                      }}
                    />
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>
    );
  }
}

export default App;
