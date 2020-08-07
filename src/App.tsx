import React from "react";
import {
    Flex,
    Text,
    IconButton,
    Icon,
    Button,
    Heading,
    DefaultTheme,
    ITheme,
    Stack,
    Tooltip,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    Input,
    Box,
    DrawerHeader,
    DrawerFooter,
    DrawerBody,
    DrawerCloseButton,
    Grid,
} from "@chakra-ui/core";
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
                        <IconButton icon="download" aria-label="Save" onClick={this.editor.saveToDotFile} />
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

                <Drawer isOpen={false} placement={"right"} size={"md"}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>Configure</DrawerHeader>
                        <DrawerBody>
                            <Grid templateColumns={"125px auto"}>
                                <Input placeholder={"Key"} />
                                <Input placeholder={"Value"} />
                                <Input placeholder={"Key"} />
                                <Input placeholder={"Value"} />
                                <Input placeholder={"Key"} />
                                <Input placeholder={"Value"} />
                            </Grid>
                        </DrawerBody>
                        <DrawerFooter>
                            <Button variant={"outline"} mr={3}>
                                Cancel
                            </Button>
                            <Button variantColor={"blue"}>Save</Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
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
