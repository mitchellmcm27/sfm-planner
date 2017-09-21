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

  renderFootprints(height, width, nrows, ncols) {
    let rows = new Array(nrows);
    let cols = new Array(ncols);

    for (let i = 0; i < nrows; i++) rows[i] = i;
    for (let j = 0; j < ncols; j++) cols[j] = j;

    return cols.map(j => {
      return rows.map(i => {
        const even = j % 2 === 0;
        const t = j * i / (nrows * ncols);
        const color = colorInterpolation("#ff0000", "#0000ff", t);
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
                background: "blue",
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
          border: "3px solid red"
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
          background: "blue",
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

    const frameInterval = (height *
      (1 - this.state.overlapY) /
      this.state.speed).toFixed(2);

    const nrows =
      Math.ceil(this.state.surveyDy / height / (1 - this.state.overlapY)) +
      this.state.extraPhotos * 1;
    const ncols =
      Math.ceil(this.state.surveyDx / width / (1 - this.state.overlapX)) +
      this.state.extraPhotos * 1;

    return (
      <div style={{ height: "100%", width: "100%", padding: 12 }}>
        <form style={{ float: "left" }}>
          <label>
            Desired resolution:
            <DebounceInput
              debounceTimeout={debounceTimeout}
              type="text"
              name="resolution"
              value={this.state.resolution}
              onChange={this.handleInputChange}
            />
            meters per pixel
          </label>
          <br />
          <label>
            Survey size (x):
            <DebounceInput
              debounceTimeout={debounceTimeout}
              type="text"
              name="surveyDx"
              value={this.state.surveyDx}
              onChange={this.handleInputChange}
            />
            meters
          </label>
          <br />
          <label>
            Survey size (y):
            <DebounceInput
              debounceTimeout={debounceTimeout}
              type="text"
              name="surveyDy"
              value={this.state.surveyDy}
              onChange={this.handleInputChange}
            />
            meters
          </label>
          <br />
          <label>
            Desired image overlap (x):
            <DebounceInput
              debounceTimeout={debounceTimeout}
              type="text"
              name="overlapX"
              value={this.state.overlapX}
              onChange={this.handleInputChange}
            />
            percent
          </label>
          <br />
          <label>
            Desired image overlap (y):
            <DebounceInput
              debounceTimeout={debounceTimeout}
              type="text"
              name="overlapY"
              value={this.state.overlapY}
              onChange={this.handleInputChange}
            />
            percent
          </label>
          <br />
          <label>
            Extra layers of photos on edges:
            <DebounceInput
              debounceTimeout={debounceTimeout}
              type="text"
              name="extraPhotos"
              value={this.state.extraPhotos}
              onChange={this.handleInputChange}
            />
            percent
          </label>
          <br />
          <label>
            Drone speed:
            <DebounceInput
              debounceTimeout={debounceTimeout}
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
            <DebounceInput
              debounceTimeout={debounceTimeout}
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
            <DebounceInput
              debounceTimeout={debounceTimeout}
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
            <DebounceInput
              debounceTimeout={debounceTimeout}
              type="text"
              name="fov"
              value={this.state.fov}
              onChange={this.handleInputChange}
            />
            degrees
          </label>
          <br />
          <label>
            Image bit depth:
            <DebounceInput
              debounceTimeout={debounceTimeout}
              type="text"
              name="bits"
              value={this.state.bits}
              onChange={this.handleInputChange}
            />
            bits per pixel
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

          <h3>
            {isNaN(nrows * ncols) ? (
              "Check input"
            ) : (
              `Number of photos: ${nrows * ncols} (${nrows}x${ncols})`
            )}
          </h3>

          <h3>
            {isNaN(
              nrows * ncols * this.state.dx * this.state.dy * this.state.bits
            ) ? (
              "Check input"
            ) : (
              `Disk space: ${(nrows *
                ncols *
                this.state.dx *
                this.state.dy *
                this.state.bits /
                8 /
                1000000000).toFixed(2)} GB (${this.state.bits}-bit DNG)`
            )}
          </h3>
        </form>
        <div style={{ float: "left", paddingLeft: 24 }}>
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

export default App;
