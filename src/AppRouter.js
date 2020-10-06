import React from 'react';
import "./App.css"

import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  withRouter, Redirect,
  useRouteMatch
} from "react-router-dom";

import App from "./App";
import Login from "./Components/Auth/Login";
import PrivateRoute from "./util/PrivateRoute";


const AppRouter = () => {

    return (
        <Router>
          <Switch>
              <PrivateRoute exact path={"/"} component={App} />
              <Route path="/login" component={Login} />
            </Switch>
        </Router>
  );
}


export default AppRouter;
