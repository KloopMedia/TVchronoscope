import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../util/Auth';
import firebase from '../../util/Firebase'

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'


const useStyles = makeStyles(theme => ({
    appbar: {
      background: 'transparent',
      boxShadow: 'none'
    },
    title: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    avatar: {
      width: theme.spacing(4),
      height: theme.spacing(4),
    },
    toolbar: {
      padding: 0
    }
  }));


const Appbar = (props) => {
    const { currentUser } = useContext(AuthContext);
    const classes = useStyles();

    return (
    <AppBar position="static" className={classes.appbar}>
        <Toolbar>
        <Grid container style={{ flexGrow: 1 }}>
            {/* <img src="https://kloop.kg/wp-content/uploads/2017/01/kloop_transparent_site.png" alt="Kloop.kg - Новости Кыргызстана" style={{ width: 150, height: 'auto' }} /> */}
            <Typography variant="h5" style={{color: "black"}}>Лукошко</Typography>
        </Grid>
        {currentUser
            ? 
                <Typography variant="body1" style={{ color: 'black', paddingLeft: 5, paddingRight: 5 }}>
                    {currentUser.email}
                </Typography>
            : null
        }
        {currentUser
            ? 
                <Button style={{ borderColor: "black", color: 'black', marginLeft: 10, fontSize: 12 }} size="small" variant="outlined" onClick={() => firebase.auth().signOut()}>
                    выход
                </Button>
            : null
        }
        </Toolbar>
    </AppBar>
    )
}

export default Appbar