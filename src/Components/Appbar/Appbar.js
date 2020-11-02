import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../util/Auth';
import firebase, {signInWithGoogle} from '../../util/Firebase'
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import LoopIcon from '@material-ui/icons/Loop';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Tooltip from '@material-ui/core/Tooltip'
import { Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        background: 'white',
        boxShadow: 'none',
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        color: 'gray',
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }
}));

export default function PersistentDrawerLeft(props) {
    const { currentUser } = useContext(AuthContext);
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    //   const copyToClipboard = (text) => {
    //     let data = JSON.stringify(text)
    //     console.log(data)
    //     navigator.clipboard.writeText(data)
    //   }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, open && classes.hide)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Grid container style={{ flexGrow: 1 }}>
                        {/* <img src="https://kloop.kg/wp-content/uploads/2017/01/kloop_transparent_site.png" alt="Kloop.kg - Новости Кыргызстана" style={{ width: 150, height: 'auto' }} /> */}
                        <Typography variant="h5" style={{ color: "black" }}>Лукошко</Typography>
                    </Grid>
                    {currentUser
                        ?
                        <Typography variant="body1" style={{ color: 'black', paddingLeft: 5, paddingRight: 5 }}>
                            {currentUser.uid}
                        </Typography>
                        : null
                    }
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
                        : <Button style={{ borderColor: "black", color: 'black', marginLeft: 10, fontSize: 12 }} size="small" variant="outlined" onClick={signInWithGoogle}>вход</Button>
                    }
                </Toolbar>
            </AppBar>
            <Drawer
                className={classes.drawer}
                variant="persistent"
                anchor="left"
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.drawerHeader}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </div>
                <Divider />
                {/* <Grid container>
                <FormControl style={{minWidth: 120}}>
                  <InputLabel id="select-system">System</InputLabel>
                  <Select
                    labelId="select-system"
                    id="select-system"
                    value={props.system}
                    onChange={props.changeSystem}
                  >
                  {props.allSystems.map((system, i) => {
                    return <MenuItem key={i} value={system.id}>{system.name}</MenuItem>
                  })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid container>
                <Typography>System ID: {props.currentSystem}</Typography>
              </Grid>
              <Grid container>
                <Grid item>
                  <TextField placeholder="Enter system's name" onChange={props.handleSystemNameChange} />
                </Grid>
                <Grid item>
                  <Button onClick={props.createTagSystem}>Create Tag System</Button>
                </Grid>
              </Grid>

              <Grid container>
                <Grid item>
                  <TextField placeholder="Enter user's ID" onChange={props.handleAddUserIdChange} />
                </Grid>
                <Grid item>
                  <Button onClick={props.addUserToSystem}>Add user</Button>
                </Grid>
              </Grid>
              <Grid container>
                <Grid item>
                  <TextField placeholder="Enter systems's ID" onChange={props.handleAddSystemChange} />
                </Grid>
                <Grid item>
                  <Button onClick={props.addSystem}>Add system</Button>
                </Grid>
              </Grid> */}
            </Drawer>
            <main style={{ padding: 0, height: '100%', background: 'transparent' }}
                className={clsx(classes.content, {
                    [classes.contentShift]: open,
                })}
            >
                <div className={classes.drawerHeader} />
                {props.children}
            </main>
        </div>
    );
}
