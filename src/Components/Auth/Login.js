import React, { useCallback, useContext } from "react";
import { withRouter, Redirect, useRouteMatch } from "react-router";
import app, {signInWithGoogle} from "../../util/Firebase.js";
import { AuthContext } from "../../util/Auth.js";

import Typography from '@material-ui/core/Typography'
import { Button, Grid } from "@material-ui/core";

const Login = ({ history }) => {

  const { currentUser } = useContext(AuthContext);
  let { url } = useRouteMatch();

  if (currentUser) {
    return <Redirect to={'/'} />;
  }

  return (
    <div>
      <Typography align="center" variant="h4">Войти с помощью аккаунта Google</Typography>
      <Grid container justify="center" style={{marginTop: 20}}>
        <Button variant="contained" onClick={signInWithGoogle}>Sign-in with Google</Button>
      </Grid>
    </div>
  );
};



export default withRouter(Login);
