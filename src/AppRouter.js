import React, { useEffect } from 'react';
import "./App.css"
import ReactGA from 'react-ga';

import {
  BrowserRouter as Router,
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
    useEffect(() => {
      ReactGA.initialize('UA-179274271-1');
      ReactGA.pageview(window.location.pathname + window.location.search);
    }, [])
    return (
        <Router>
          <Switch>
              {/* <PrivateRoute exact path={"/"} component={App} />
              <Route path="/login" component={Login} /> */}
              <Route exact path={"/"} component={App}/>
            </Switch>
        </Router>
  );
}


export default AppRouter;
