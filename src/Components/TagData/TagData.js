import React from 'react'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import {Grid} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }));


const tagData = (props) => {
    const classes = useStyles();
    return (
        <div>
            <Grid container justify="center" spacing={2}>
                <Grid item>
                    <TextField
                        id="tag_field"
                        label="Tag"
                        onChange={props.handleTagTextChange}
                        value={props.tag}/>
                </Grid>
                {/* <Grid item>
                    <Button
                        variant="contained"
                        onClick={props.filter}>
                        Filter
                    </Button>
                </Grid> */}
                <FormControl className={classes.formControl}>
                    <InputLabel id="filter">Filter</InputLabel>
                    <Select
                    labelId="filter"
                    id="filter"
                    value={props.filterTag}
                    onChange={props.handleFilterChange}
                    >
                    <MenuItem value="">Все</MenuItem>
                    {props.allTags.map((tag,i) => <MenuItem key={i} value={tag}>{tag}</MenuItem>)}
                    </Select>
                </FormControl>
                <Grid item>
                    <Button
                        variant="contained"
                        disabled={props.tag.length === 0}
                        onClick={() => props.handleTagClick('tag')}>
                        Tag all
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        disabled={props.tag.length === 0}
                        onClick={() => props.handleTagClick('negtag')}>
                        Negtag all
                    </Button>
                </Grid>

            </Grid>
            <Grid container justify="center" spacing={2}>
                {/* <Grid item> <FormControlLabel
                    control={<Switch checked={props.tagModeEnabled}
                                     onChange={props.handleTagModeChange}/>}
                    label="Hide (neg)tagged"
                /></Grid> */}
                <Grid item> <FormControlLabel
                    control={<Switch checked={props.hideTags}
                                     onChange={props.handleTagsHide}/>}
                    label="Hide tagged"
                /></Grid>
                <Grid item> <FormControlLabel
                    control={<Switch checked={props.hideNegtags}
                                     onChange={props.handleNegtagsHide}/>}
                    label="Hide negtagged"
                /></Grid>
                <Grid item> <FormControlLabel
                    control={<Switch checked={props.filterAll}
                                     onChange={props.handleFilterAllChange}/>}
                    label="filter all"
                /></Grid>
            </Grid>
        </div>

    )
}

export default tagData