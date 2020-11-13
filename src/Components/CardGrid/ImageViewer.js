import React, { useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const fs = require('fs')
const request = require('request')

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
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function CustomizedDialogs(props) {

  // const download = (url, path, callback) => {
  //   request.head(url, (err, res, body) => {
  //     request(url)
  //       .pipe(fs.createWriteStream(path))
  //       .on('close', callback)
  //   })
  // }

    return (
        <div>
        <Dialog onClose={props.handleClose} aria-labelledby="customized-dialog-title" open={props.open} 
        // fullWidth={true}
        // maxWidth={'md'} 
        >
            <DialogTitle id="customized-dialog-title" onClose={props.handleClose}>
            {props.title}
            </DialogTitle>
            <DialogContent dividers>
                <img src={props.image} alt="Girl in a jacket" width="100%" height="100%" />
            </DialogContent>
            {/* <DialogActions>
            <Button autoFocus onClick={() => download()} color="primary">
                Скачать
            </Button>
            </DialogActions> */}
        </Dialog>
        </div>
    );
}
