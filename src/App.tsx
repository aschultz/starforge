import React from "react";
import {
  Box,
  Flex,
  Text,
  useTheme,
  IconButton,
  Icon,
  Button,
  Heading,
} from "@chakra-ui/core";
import { Editor } from "./Editor";
import "./App.css";

function App() {
  const theme = useTheme();
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
        padding="10px"
        backgroundColor={theme.colors.gray[600]}
      >
        <Heading size="md" color={theme.colors.white}>
          StarForge
        </Heading>
        <Flex direction="row" justifyContent="right">
          <Button leftIcon="add">Add</Button>
        </Flex>
      </Flex>

      <Editor />
    </Flex>
  );
}

export default App;
