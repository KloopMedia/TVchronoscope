import React, { useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PostAddIcon from '@material-ui/icons/PostAdd';
import AddIcon from '@material-ui/icons/Add';
import { Box } from '@material-ui/core';
import TextField from '@material-ui/core/TextField'
import Divider from '@material-ui/core/Divider'
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MuiMenuItem from '@material-ui/core/MenuItem';


const useStyles = makeStyles((theme) => ({
  textfield: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    border: '2px solid black',
    borderRadius: 5
  },
  button: {
    color: "white",
    background: 'black',
    marginTop: 7,
    marginBottom: 10
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  }
}));

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const MenuItem = withStyles({
  root: {
    justifyContent: "flex-end"
  }
})(MuiMenuItem);

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6" align="center">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(0),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
}))(MuiDialogActions);

export default function CustomizedDialogs(props) {
  const classes = useStyles();

  return (
    <div>
      <Dialog onClose={props.handleClose} aria-labelledby="customized-dialog-title" open={props.open} fullWidth={true} maxWidth={"md"} >
        <DialogTitle id="customized-dialog-title" onClose={props.handleClose}>
          <Grid container justify="center" style={{ paddingRight: 20, paddingLeft: 20 }}>
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
            <Typography variant="body1" style={{ flex: 1, alignSelf: "center" }}>ID системы: <Typography component="span" variant="subtitle2">{props.currentSystem}</Typography></Typography>
            <Typography variant="body1" style={{ flex: 1, alignSelf: "center" }}>ID пользователя: <Typography component="span" variant="subtitle2">{props.userId}</Typography></Typography>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyItems="center">
            <Grid container direction="column" alignItems="center">
              <AddIcon fontSize="large" />
              <Typography variant="h6">Создать систему</Typography>
              <br />
              <TextField
                size="small"
                placeholder="Введите имя системы"
                onChange={props.handleSystemNameChange}
                className={classes.textfield}
                InputProps={{
                  disableUnderline: true
                }}
              />
              <Button variant="contained" className={classes.button} onClick={props.createTagSystem}>Создать</Button>
            </Grid>
            <Divider variant="middle" orientation="vertical" flexItem />
            <Grid container direction="column" alignItems="center">
              <PostAddIcon fontSize="large" />
              <Typography variant="h6">Добавить систему</Typography>
              <br />
              <TextField
                size="small"
                placeholder="Введите id системы"
                onChange={props.handleAddSystemChange}
                className={classes.textfield}
                InputProps={{
                  disableUnderline: true
                }}
              />
              <Button
                variant="contained"
                className={classes.button}
                onClick={props.addSystem}
              >
                Добавить
                    </Button>
            </Grid>
            <Divider variant="middle" orientation="vertical" flexItem />
            <Grid container direction="column" alignItems="center">
              <PersonAddIcon fontSize="large" />
              <Typography variant="h6">Добавить пользователя</Typography>
              <br />
              <TextField
                size="small"
                placeholder="Введите id пользователя"
                onChange={props.handleAddUserIdChange}
                className={classes.textfield}
                InputProps={{
                  disableUnderline: true
                }}
              />
              <Button
                variant="contained"
                className={classes.button}
                onClick={props.addUserToSystem}
              >
                Добавить
                    </Button>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions style={{justifyContent: 'center'}}>
          <Box display="flex" justifyItems="center" p={2}>
            <Grid container direction="column" display="flex" justify="center" alignItems="center">
              <Grid container alignItems="center" display="flex" justify="center">
                <TextField size="small"
                  className={classes.textfield}
                  style={{ margin: 3, width: 200 }}
                  value={props.sampleName}
                  InputProps={{
                    disableUnderline: true
                  }} onChange={props.handleSampleNameChange} placeholder="Наименование выборки" />
                <TextField size="small"
                  className={classes.textfield}
                  value={props.sampleSize}
                  style={{ margin: 3, width: 160 }}
                  InputProps={{
                    disableUnderline: true
                  }} type="number" onChange={props.handleSampleSizeChange} placeholder="Размер выборки" />
                <TextField size="small"
                  className={classes.textfield}
                  value={props.sampleDate}
                  style={{ margin: 3, width: 160 }}
                  InputProps={{
                    disableUnderline: true
                  }} type="date" onChange={props.handleSampleDateChane} />
              </Grid>
              <Grid container alignItems="center" display="flex" justify="center">
                <Button
                  disabled={props.sampleName.length === 0 && props.sampleSize === '0' && props.sampleDate === ''}
                  onClick={props.requestSampleButton} variant="contained"
                  className={classes.button} >Загрузить комментарии</Button>
              </Grid>
            </Grid>
          </Box>
        </DialogActions>
      </Dialog>
    </div>
  );
}
