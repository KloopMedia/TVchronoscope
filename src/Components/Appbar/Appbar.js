import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../util/Auth';
import firebase, { signInWithGoogle } from '../../util/Firebase'
import clsx from 'clsx';
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MuiMenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '../SystemDialog/Dialog'
import Menu from '@material-ui/core/Menu';
import Avatar from '@material-ui/core/Avatar';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuIcon from '@material-ui/icons/Menu';
import Divider from '@material-ui/core/Divider'
import InputLabel from '@material-ui/core/InputLabel'


const drawerWidth = 220;

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
    },
    small: {
        width: theme.spacing(4),
        height: theme.spacing(4),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    }
}));

const MenuItem = withStyles({
    root: {
        justifyContent: "flex-end"
    }
})(MuiMenuItem);

// const drawer = (
//     <div>
//         <div className={classes.toolbar} />
//         <Divider />
//         <nav>
//             <ul>
//                 <li>
//                     <Link to="/">Главная</Link>
//                 </li>
//                 <li>
//                     <Link to="/profile">Профиль</Link>
//                 </li>
//                 <li>
//                     <Link to="/tasks">Задания</Link>
//                 </li>
//                 <li>
//                     <Link to="/request">Получить задание</Link>
//                 </li>
//                 <li>
//                     <Link to="/notifications">Уведомления</Link>
//                 </li>
//                 {moderator ? <li>
//                     <Link to="/tasksObserver">Модератор</Link>
//                 </li> : null}
//                 {moderator ? <li>
//                     <Link to="/faq">FAQ для модераторов</Link>
//                 </li> : null}
//             </ul>
//         </nav>
//     </div>
// );

export default function PersistentDrawerLeft(props) {
    const { currentUser } = useContext(AuthContext);
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false)
    const [anchorEl, setAnchorEl] = React.useState(null);
    const menuOpen = Boolean(anchorEl);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleDialogOpen = () => {
        setDialogOpen(true)
    }

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null)
        console.log(currentUser)
    }

    //   const copyToClipboard = (text) => {
    //     let data = JSON.stringify(text)
    //     console.log(data)
    //     navigator.clipboard.writeText(data)
    //   }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Dialog
                open={dialogOpen}
                handleClose={handleDialogClose}
                showAdvanced={props.showAdvanced}
                currentSystem={props.currentSystem}
                userId={currentUser.uid}
                allSystems={props.allSystems}
                handleShowAdvancedChange={props.handleShowAdvancedChange}
                handleSystemChange={props.handleSystemChange}
                handleSystemNameChange={props.handleSystemNameChange}
                handleAddSystemChange={props.handleAddSystemChange}
                handleAddUserIdChange={props.handleAddUserIdChange}
                createTagSystem={props.createTagSystem}
                addSystem={props.addSystem}
                addUserToSystem={props.addUserToSystem}
                handleSampleNameChange={props.handleSampleNameChange}
                handleSampleSizeChange={props.handleSampleSizeChange}
                handleSampleDateChane={props.handleSampleDateChane}
                handleTestButton={props.handleTestButton}
                sampleName={props.sampleName}
                sampleSize={props.sampleSize}
                sampleDate={props.sampleDate}
            />
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
                        <FormControl variant="outlined" className={classes.formControl} size="small">
                            <Select
                                id="select-system"
                                value={props.currentSystem}
                                onChange={props.handleSystemChange}
                            >
                                {props.allSystems.map((system, i) => {
                                    return <MenuItem key={i} value={system.id}>{system.name}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                        : null
                    }
                    {currentUser
                        ?
                        <IconButton aria-label="add" size="small" onClick={handleDialogOpen} style={{ marginRight: 10 }}>
                            <AddIcon fontSize="large" style={{ color: 'black' }} />
                        </IconButton>
                        : null
                    }
                    {currentUser
                        ?
                        <div>
                            <IconButton
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                                size="small"
                            >
                                <Avatar src={currentUser.photoURL} className={classes.small} />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={menuOpen}
                                onClose={handleMenuClose}
                            >
                                <Grid container direction="column" alignItems="center" style={{ padding: 10 }}>
                                    <Avatar src={currentUser.photoURL} style={{ marginBottom: 8 }} />
                                    <Typography variant="body2">{currentUser.displayName}</Typography>
                                    <Typography variant="body2">{currentUser.email}</Typography>
                                    <Typography variant="body2">ID: <Typography component="span" variant="subtitle2">{currentUser.uid}</Typography></Typography>
                                </Grid>
                                <MenuItem onClick={() => firebase.auth().signOut()}>Выход</MenuItem>
                            </Menu>
                        </div>
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
                <Grid container>
                    <FormControl style={{ minWidth: 120 }}>
                        <InputLabel id="select-system">Система</InputLabel>
                        <Select
                            labelId="select-system"
                            id="select-system"
                            value={props.currentSystem}
                            onChange={props.handleSystemChange}
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
