import React, { Component } from 'react';

import {
    CardContent, CardMedia, Typography, CardActionArea, Box
} from "@material-ui/core";

const Content = (props) => {

    return (
        <CardActionArea onClick={() => props.handleOpen(props.img_data)}>
            {props.img_data.get('type') !== "text" && props.img_data.get('type') !== "embed"
                ?
                <CardMedia
                    style={{ height: 250 }}
                    image={props.img_data.get('url')}
                />
                :
                <CardContent>
                    <Box style={{ maxHeight: 140, overflow: 'auto', paddingBottom: 10}}>
                        <Typography variant="h6">{props.img_data.get('sentence')}</Typography>
                    </Box>
                    <Box style={{ maxHeight: 110, overflow: 'auto' }}>
                        <Typography variant="body2">{props.img_data.get('text')}</Typography>
                    </Box>
                </CardContent>
            }
        </CardActionArea>
    );
}

export default Content