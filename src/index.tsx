import React from "react";
import ReactDOM from "react-dom";
import {
  CSSReset,
  ThemeProvider,
  theme as defaultTheme,
} from "@chakra-ui/core";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

function RenderApp() {
  const theme = {
    ...defaultTheme,
    icons: {
      ...defaultTheme.icons,
      // TODO: Add icons here
    },
  };
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <RenderApp />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
