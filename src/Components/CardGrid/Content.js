import React, { Component } from 'react';

import {

    CardContent, Grid, Typography,
    Box,
    Button,
    Menu,
    MenuItem
} from "@material-ui/core";


const SimpleMenu = (props) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOptionClick = (tag) => {
        props.tagClick('tag', props.i, tag)
        handleClose()
    }

    return (
        <div>
            <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                Add tag
            </Button>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {props.allTags.length > 0 && props.allTags.map(tag => <MenuItem onClick={() => handleOptionClick(tag)}>{tag}</MenuItem>)}
            </Menu>
        </div>
    );
}



const Content = (props) => {

    const type = props.img_data.get('type')
    const date = props.img_data.get('date')
    console.log(props.img_data.get('distance'))

    return (
        <CardContent>
            <Box>
                <SimpleMenu i={props.i} allTags={props.allTags} tagClick={props.tagClick} />
                <Typography gutterBottom variant="h6" component="h2">
                    {props.showAdvanced && ('Tags: ' + props.img_data.get('tags'))}
                </Typography>
                {props.img_data.get('distance') && (
                    (type === 'text' || type === 'embed') ?
                        <Typography variant="body2" color="textSecondary" component="div">
                            Схожесть текста: {props.img_data.get('distance').toFixed(2)}
                        </Typography>
                        :
                        <Typography variant="body2" color="textSecondary" component="div">
                            Схожесть лица: {props.img_data.get('distance').toFixed(2)}
                        </Typography>
                )
                }
                {!isNaN(date.getTime()) && <Typography variant="body2" color="textSecondary" component="div">
                    {props.showAdvanced ?
                        ('Time: ' + date.toISOString())
                        :
                        'Дата: ' + date.toISOString().substring(0, 10)}
                </Typography>}
                <Typography variant="body2" color="textSecondary" component="div">
                    {props.showAdvanced && ('Negtags: ' + props.img_data.get('negtags'))}
                </Typography>
                {props.img_data.get('account') &&
                    <Typography variant="body2" color="textSecondary" component="div">
                        Аккаунт: {props.img_data.get('account')}
                    </Typography>
                }
                {props.img_data.get('url') && (type === 'text' || type === 'embed') &&
                    <Box style={{ overflow: 'auto' }}>
                        <Typography variant="body2" color="textSecondary" component="div">
                            Ссылка: {props.img_data.get('url')}
                        </Typography>
                    </Box>
                }
            </Box>
        </CardContent>
    );
}

export default Content