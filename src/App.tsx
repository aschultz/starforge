import React from "react";
import { Flex, Text, IconButton, Icon, Button, Heading, DefaultTheme, ITheme, Stack } from "@chakra-ui/core";
import { GraphEditor } from "./editor/GraphEditor";
import "./App.css";
import { withTheme } from "emotion-theming";

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
                        <IconButton icon="add" aria-label="Add" onClick={this.onAddClick} />
                        <IconButton icon="delete" aria-label="Remove" onClick={undefined} />
                        <IconButton icon="search" aria-label="Reset Zoom" onClick={undefined} />
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
        } else {
            this.editor.detach();
        }
    };

    private onAddClick = () => {
        //this.editor.addNode();
    };
}

const App = withTheme(_App);

export default App;
