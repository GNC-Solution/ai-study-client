import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Test from "./pages/Test";
import Room from "./pages/Room";
import StudyStatistics from "./pages/StudyStatistics";


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

        <Route path="/room">
          <Room />
        </Route>
        <Route path="/test">
          <Test roomNumber={"2"} />
        </Route>
        <Route path="/studyStatistics">
          <StudyStatistics/>
        </Route>

      </Switch>
    </BrowserRouter>
  );
}

export default App;
