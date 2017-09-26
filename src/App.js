import React, { Component } from "react";
import Line from "react-lineto";
import { colorInterpolation } from "color-interpolator";
import DebounceInput from "react-debounce-input";

import logo from "./logo.svg";
import "./App.css";

const debounceTimeout = 500;

class App extends Component {
  constructor() {
    super();
    this.state = {
      resolution: "0.03", // m/px
      overlapX: "0.75",
      overlapY: "0.75",
      speed: "10", // m/s
      dx: "4000", // px
      dy: "3000", // px
      fov: "78.8", // degrees
      bits: "14", // bits per pixel
      surveyDx: "500", // m
      surveyDy: "500", // m
      extraPhotos: "0" // number of photos to add on the edges of the survey
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

  renderFootprints(height, width, nrows_in, ncols_in) {
    // convert to number
    let nrows = nrows_in * 1;
    let ncols = ncols_in * 1;

    // handle bad input
    if (!isFinite(nrows) || isNaN(nrows)) nrows = 0;
    if (!isFinite(ncols) || isNaN(ncols)) ncols = 0;

    // make sure we aren't given too many things to process
    if (nrows > 50) nrows = 50;
    if (ncols > 50) ncols = 50;

    let rows = new Array(nrows);
    let cols = new Array(ncols);

    for (let i = 0; i < nrows; i++) rows[i] = i;
    for (let j = 0; j < ncols; j++) cols[j] = j;

    return cols.map(j => {
      return rows.map(i => {
        const even = j % 2 === 0;
        const t = j * i / (nrows * ncols);
        const color = colorInterpolation("#ff3355", "#1020ff", t);
        const last = j == ncols - 1 && i == nrows - 1;
        return (
          <div>
            <div
              className={"A" + i + j}
              style={{
                position: "absolute",
                top: height * (1 - this.state.overlapY) * i,
                left: width * (1 - this.state.overlapX) * j,
                width: width,
                height: height,
                background: "#1020ff",
                opacity: 0.15
              }}
            />
            {last && (
              <span
                className={"A" + i + j}
                style={{
                  position: "absolute",
                  top: height * (1 - this.state.overlapY) * i - 2,
                  left: width * (1 - this.state.overlapX) * j - 2,
                  width: width,
                  height: height,
                  border: "2px solid black",
                  opacity: 0.5
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: width + 3,
                    width: width,
                    top: height / 2,
                    textAlign: "left"
                  }}
                >
                  {height + " m"}
                </span>
                <span
                  style={{
                    position: "absolute",
                    left: width / 2,
                    top: height + 3,
                    textAlign: "center"
                  }}
                >
                  {width + " m"}
                </span>
              </span>
            )}
            {last && this.renderSurveyArea(height, width)}
          </div>
        );
      });
    });
  }

  renderSurveyArea(height, width) {
    return (
      <div
        style={{
          position: "absolute",
          left:
            this.state.extraPhotos * 1 * (1 - this.state.overlapX) * width / 2 +
            width / 2,
          top:
            this.state.extraPhotos *
              1 *
              (1 - this.state.overlapY) *
              height /
              2 +
            height / 2,
          width: this.state.surveyDx,
          height: this.state.surveyDy,
          border: "3px solid #ff3355"
        }}
      />
    );
  }

  renderFootprint(height, width) {
    return (
      <div
        style={{
          width: width,
          height: height,
          background: "#1020ff",
          opacity: 0.15
        }}
      />
    );
  }

  render() {
    const droneHeight = (this.state.dy *
      this.state.resolution /
      2 /
      Math.tan(this.state.fov * Math.PI / 180 / 2)).toFixed(2);

    const height = this.state.dy * this.state.resolution;
    const width = this.state.dx * this.state.resolution;

    const frontLap = Math.max(0, Math.min(1, this.state.overlapY));
    const sideLap = Math.max(0, Math.min(1, this.state.overlapX));

    const frameInterval = Math.abs(
      (height * (1 - frontLap) / this.state.speed).toFixed(2)
    );

    const nrows =
      Math.ceil(this.state.surveyDy / height / (1 - frontLap)) +
      this.state.extraPhotos * 1;
    const ncols =
      Math.ceil(this.state.surveyDx / width / (1 - sideLap)) +
      this.state.extraPhotos * 1;

    const diskSpace =
      nrows *
      ncols *
      this.state.dx *
      this.state.dy *
      this.state.bits /
      8 /
      1000000000;

    const shutterSpeed = this.state.resolution / Math.abs(this.state.speed);

    return (
      <div style={{ height: "100%", width: "100%", padding: 12 }}>
        <h1>SfM Planner</h1>
        <div>A tool to estimate parameters for UAS surveying.</div>
        <div>
          Given desired resolution, survey area, photo overlap, etc., the
          software calculates flight parameters.
        </div>
        <div>Default inputs are based on the DJI Mavic Pro.</div>
        <form style={{ float: "left" }}>
          <h2>Inputs</h2>

          <label style={inputLabel}>
            Desired resolution:
            <DebounceInput
              debounceTimeout={debounceTimeout}
              type="text"
              name="resolution"
              value={this.state.resolution}
              onChange={this.handleInputChange}
              style={input}
            />
            meters per pixel
          </label>
          <br />
          <label style={inputLabel}>
            Survey size (x):
            <DebounceInput
              style={input}
              debounceTimeout={debounceTimeout}
              type="text"
              name="surveyDx"
              value={this.state.surveyDx}
              onChange={this.handleInputChange}
            />
            meters
          </label>
          <br />
          <label style={inputLabel}>
            Survey size (y):
            <DebounceInput
              style={input}
              debounceTimeout={debounceTimeout}
              type="text"
              name="surveyDy"
              value={this.state.surveyDy}
              onChange={this.handleInputChange}
            />
            meters
          </label>
          <br />
          <label style={inputLabel}>
            Desired image overlap (x):
            <DebounceInput
              style={input}
              debounceTimeout={debounceTimeout}
              type="text"
              name="overlapX"
              value={this.state.overlapX}
              onChange={this.handleInputChange}
            />
            percent
          </label>
          <br />
          <label style={inputLabel}>
            Desired image overlap (y):
            <DebounceInput
              style={input}
              debounceTimeout={debounceTimeout}
              type="text"
              name="overlapY"
              value={this.state.overlapY}
              onChange={this.handleInputChange}
            />
            percent
          </label>
          <br />
          <label style={inputLabel}>
            Extra layers of photos on edges:
            <DebounceInput
              style={input}
              debounceTimeout={debounceTimeout}
              type="text"
              name="extraPhotos"
              value={this.state.extraPhotos}
              onChange={this.handleInputChange}
            />
            layers
          </label>
          <br />
          <label style={inputLabel}>
            Drone speed:
            <DebounceInput
              style={input}
              debounceTimeout={debounceTimeout}
              type="text"
              name="speed"
              value={this.state.speed}
              onChange={this.handleInputChange}
            />
            meters per second
          </label>
          <br />
          <label style={inputLabel}>
            Image dimension (x):
            <DebounceInput
              style={input}
              debounceTimeout={debounceTimeout}
              type="text"
              name="dx"
              value={this.state.dx}
              onChange={this.handleInputChange}
            />
            pixels
          </label>
          <br />
          <label style={inputLabel}>
            Image dimension (y):
            <DebounceInput
              style={input}
              debounceTimeout={debounceTimeout}
              type="text"
              name="dy"
              value={this.state.dy}
              onChange={this.handleInputChange}
            />
            pixels
          </label>
          <br />
          <label style={inputLabel}>
            Camera field of view:
            <DebounceInput
              style={input}
              debounceTimeout={debounceTimeout}
              type="text"
              name="fov"
              value={this.state.fov}
              onChange={this.handleInputChange}
            />
            degrees
          </label>
          <br />
          <label style={inputLabel}>
            Image bit depth:
            <DebounceInput
              style={input}
              debounceTimeout={debounceTimeout}
              type="text"
              name="bits"
              value={this.state.bits}
              onChange={this.handleInputChange}
            />
            bits per pixel
          </label>
          <h2>Calculations</h2>
          <div style={output}>
            {isNaN(droneHeight) ? (
              "Check input"
            ) : (
              `Drone height: ${droneHeight} meters`
            )}
          </div>

          <div style={output}>
            {" "}
            {isNaN(frameInterval) ? (
              "Check input"
            ) : (
              `Photo interval: ${frameInterval} seconds`
            )}
          </div>

          <div style={output}>
            {" "}
            {isNaN(nrows * ncols) ? (
              "Check input"
            ) : (
              `Number of photos: ${nrows * ncols} (${nrows}x${ncols})`
            )}
          </div>

          <div style={output}>
            {" "}
            {isNaN(diskSpace) ? (
              "Check input"
            ) : (
              `Disk space: ${diskSpace.toFixed(2)} GB (${this.state
                .bits}-bit DNG)`
            )}
          </div>

          <div style={output}>
            {" "}
            {isNaN(diskSpace) ? (
              "Check input"
            ) : (
              `Processing time (est.): ${(diskSpace *
                1000 /
                4.82 /
                3 /
                60.0).toFixed(2)} hours`
            )}
          </div>
        </form>
        <div style={{ float: "left", paddingLeft: 24 }}>
          <h2>Map</h2>
          <h3>Single photo</h3>
          {this.renderFootprint(height, width)}

          <h3>Survey area</h3>
          <div style={{ position: "relative" }}>
            {this.renderFootprints(height, width, nrows, ncols)}
          </div>
        </div>
      </div>
    );
  }
}

const inputLabel = {
  color: "#404040",
  padding: 4,
  marginBottom: 4
};

const input = {
  margin: 4,
  padding: 4,
  background: "#dddddd",
  color: "#223366",
  border: "0px",
  width: 72,
  fontWeight: "bold"
};

const output = {
  fontWeight: "bold",
  color: "#22222",
  background: "#fafafa",
  padding: 4,
  marginBottom: 4
};

export default App;
