import React from 'react'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { Grid } from "@material-ui/core";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Box from '@material-ui/core/Box'
import Divider from '@material-ui/core/Divider'

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));


const AntSwitch = withStyles((theme) => ({
    root: {
      width: 60,
    //   height: 16,
    //   padding: 0,
      display: 'flex',
    },
    switchBase: {
      
      color: theme.palette.common.white,
      '&$checked': {
        transform: 'translateX(22px)',
        color: theme.palette.common.white,
        '& + $track': {
          opacity: 1,
          backgroundColor: '#52d869',
          borderColor: '#52d869',
        },
      },
    },
    // thumb: {
    //   width: 12,
    //   height: 12,
    //   boxShadow: 'none',
    // },
    track: {
      border: `1px solid ${theme.palette.common.white}`,
      borderRadius: 9,
      opacity: 1,
      backgroundColor: theme.palette.grey[500],
    },
    checked: {},
  }))(Switch);
  


const tagData = (props) => {
    const classes = useStyles();
    return (
        <div>
            <Box display="flex">
                <Grid container alignItems="center" justify="center">
                    <Grid item style={{ padding: 8 }}>
                        {/* <TextField
                        id="tag_field"
                        label="Tag"
                        onChange={props.handleTagTextChange}
                        value={props.tag}/> */}
                        <Autocomplete
                            id="combo-box-demo"
                            size="small"
                            freeSolo
                            options={props.allTags}
                            getOptionLabel={(tag) => tag}
                            style={{ width: 275 }}
                            value={props.tag}
                            onInputChange={(event, newInputValue) => {
                                props.handleTagTextChange(newInputValue);
                            }}
                            renderInput={(params) => <TextField variant="outlined" {...params} label="Tag" />}
                        />
                    </Grid>
                    {/* <Grid item>
                    <Button
                        variant="contained"
                        onClick={props.filter}>
                        Filter
                    </Button>
                </Grid> */}
                    {/* <FormControl className={classes.formControl}>
                    <InputLabel id="filter-label">Фильтр</InputLabel>
                    <Select
                    labelId="filter-label"
                    id="filter"
                    value={props.filterTag}
                    onChange={props.handleFilterChange}
                    >
                    <MenuItem value="">Все</MenuItem>
                    {props.allTags.map((tag,i) => <MenuItem key={i} value={tag}>{tag}</MenuItem>)}
                    </Select>
                </FormControl> */}
                    <Grid item style={{ padding: 8 }}>
                        <Button
                            variant="outlined"
                            disabled={props.tag.length === 0}
                            onClick={() => props.handleTagClick('tag')}>
                            Tag all
                    </Button>
                    </Grid>
                    <Grid item style={{ padding: 8 }}>
                        <Button
                            variant="outlined"
                            disabled={props.tag.length === 0}
                            onClick={() => props.handleTagClick('negtag')}>
                            Negtag all
                    </Button>
                    </Grid>

                {/* </Grid> */}
                {/* <Divider orientation="vertical" variant="middle" style={{ marginRight: 5, marginLeft: 5}} /> */}
                {/* <Grid container style={{display: "block"}} xs={5}> */}
                    {/* <Grid item> <FormControlLabel
                    control={<Switch checked={props.tagModeEnabled}
                                     onChange={props.handleTagModeChange}/>}
                    label="Hide (neg)tagged"
                /></Grid> */}
                <Box display="flex" pl={1}>
                    <Grid item> <FormControlLabel
                        control={<AntSwitch checked={props.hideTags}
                            onChange={props.handleTagsHide} />}
                        label="Hide tagged"
                        labelPlacement="bottom"
                    />
                    </Grid>
                    <Grid item> <FormControlLabel
                        control={<AntSwitch checked={props.hideNegtags}
                            onChange={props.handleNegtagsHide} />}
                        label="Hide negtagged"
                        labelPlacement="bottom"
                    /></Grid>
                    <Grid item> <FormControlLabel
                        control={<AntSwitch checked={props.filterAll}
                            onChange={props.handleFilterAllChange} />}
                        label="Filter all"
                        labelPlacement="bottom"
                    /></Grid>
                    <Grid item> <FormControlLabel
                        control={<AntSwitch checked={props.showCharts}
                            onChange={props.handleShowCharts} />}
                        label="Show charts"
                        labelPlacement="bottom"
                    /></Grid>
                    </Box>
                </Grid>
            </Box>
        </div>

    )
}

export default tagData