import React, { Component } from 'react';

import {
    Button, Card, CardActionArea, CardActions,
    CardContent, CardMedia, Grid, Typography,
    TablePagination,
    Box
} from "@material-ui/core";

export default function TxtCardContent(props) {

    return (
        <CardContent>
            <Box style={{ maxHeight: 200, overflow: 'auto'}}>
                <Typography variant="h6">{props.img_data.get('sentence')}</Typography>
            </Box>
            {/* <Box style={{ maxHeight: 200, overflow: 'auto' }}>
                <Typography variant="body2">{props.img_data.get('text')}</Typography>
            </Box> */}
        </CardContent >
    );
}