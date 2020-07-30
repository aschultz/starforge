import React from "react";
import { Flex, Text, IconButton, Icon, Button, Heading, DefaultTheme, ITheme, Stack, Tooltip } from "@chakra-ui/core";
import { GraphEditor } from "./editor/GraphEditor";
import "./App.css";
import { withTheme } from "emotion-theming";
import { MdZoomOutMap } from "react-icons/md";

type Props = {
    theme: ITheme;
};

//
// The "data-paper-resize" attribute on canvas causes paper to resize the canvas buffer when the window resizes.
// Otherwise, the buffer won't match the styled dimensions we set (100% width and height)
//

class _App extends React.Component<Props> {
    private editor: GraphEditor = new GraphEditor();

    render() {
        const theme = this.props.theme;
        return (
            <Flex
                direction="column"
                backgroundColor={theme.colors.gray[800]}
                height="100vh"
                justifyContent="flex-start"
                alignItems="stretch"
            >
                <Flex
                    flex={0}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingX="10px"
                    backgroundColor={theme.colors.gray[600]}
                >
                    <Heading size="md" color={theme.colors.white}>
                        StarForge
                    </Heading>
                    <Stack isInline={true} justify="right" spacing={"10px"} paddingY="10px">
                        <IconButton icon="add" aria-label="Add" onClick={undefined} />
                        <IconButton icon="delete" aria-label="Remove" onClick={undefined} />
                        <Tooltip label="Reset Zoom" aria-label="Reset Zoom" showDelay={500}>
                            <IconButton icon={MdZoomOutMap} aria-label="Reset Zoom" onClick={this.editor.resetZoom} />
                        </Tooltip>
                    </Stack>
                </Flex>

                <Flex flex={1} overflowY="auto">
                    <canvas
                        ref={this.onRef}
                        style={{
                            background: "#CCC",
                            width: "100%",
                            height: "100%",
                        }}
                        data-paper-resize
                    />
                </Flex>
            </Flex>
        );
    }

    private onRef = (instance: HTMLCanvasElement | null) => {
        if (instance) {
            this.editor.attach(instance);
            // TODO: Hook up handlers to show React popups when certain actions happen
        } else {
            this.editor.detach();
        }
    };
}

const App = withTheme(_App);

export default App;
