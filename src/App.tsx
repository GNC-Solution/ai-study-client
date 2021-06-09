import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Test from "./pages/Test";

// TODO: test route should be removed
function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/test">
          <Test roomNumber={"2"} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
