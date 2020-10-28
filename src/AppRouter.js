import React, {useContext} from 'react';
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
import PublicApp from './PublicApp'
import Login from "./Components/Auth/Login";
import PrivateRoute from "./util/PrivateRoute";
import { AuthContext } from './util/Auth';

const AppRouter = () => {
  const { currentUser } = useContext(AuthContext);
  return (
      <Router>
        <Switch>
          {
            currentUser 
            ? <Route exact path={"/"} component={App} />
            : <Route exact path={"/"} component={PublicApp} />
          }
          <Route path="/login" component={Login} />
        </Switch>
      </Router>
  );
}


export default AppRouter;
