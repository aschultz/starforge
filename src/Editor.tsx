import React from "react";
import paper from "paper/dist/paper-core";
import { Flex } from "@chakra-ui/core";

type Props = {};

//
// "data-paper-resize" causes paper to resize the canvas buffer when the window resizes. Otherwise,
// the buffer won't match the styled dimensions we set (100% width and height)
//

export class Editor extends React.PureComponent<Props> {
  private _ref: HTMLCanvasElement | null = null;
  private _project: paper.Project | null = null;

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <Flex flex={1} overflowY="auto">
        <canvas
          ref={this.onRef}
          style={{ background: "#CCC", width: "100%", height: "100%" }}
          data-paper-resize
        />
      </Flex>
    );
  }

  private onRef = (instance: HTMLCanvasElement | null) => {
    this._ref = instance;
    if (instance) {
      this._project = new paper.Project(instance);

      let p = new paper.Path();
      p.strokeColor = new paper.Color("black");
      p.moveTo(new paper.Point(50, 50));
      p.lineTo(new paper.Point(100, 100));
    }
  };
}
