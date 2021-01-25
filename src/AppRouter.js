import React, {useState, useContext} from 'react';
import "./App.css"

import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  withRouter, Redirect,
  useRouteMatch
} from "react-router-dom";
import firebase from './util/Firebase'

import App from "./App";
import PublicApp from './PublicApp'
import Login from "./Components/Auth/Login";
import PrivateRoute from "./util/PrivateRoute";
import { AuthContext } from './util/Auth';

const AppRouter = () => {
  const { currentUser } = useContext(AuthContext);
  const [exist, setExist] = useState(false)
  if (currentUser && currentUser.uid) {
    firebase.firestore().collection("users").doc(currentUser.uid).get().then(doc => {
      console.log(currentUser.uid)
      if (doc && doc.exists) {
        console.log("exist")
        setExist(true)
      }
    })
  }
  
  return (
      <Router>
        <Switch>
          {
            currentUser && exist 
            ? <Route exact path={"/"} component={App} />
            : <Route exact path={"/"} component={PublicApp} />
          }
          <Route exact path={"/text"} component={App} />
          <Route exact path={"/textembed"} component={App} />
          <Route path="/login" component={Login} />
        </Switch>
      </Router>
  );
}


export default AppRouter;
