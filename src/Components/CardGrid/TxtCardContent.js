import React, { Component }  from 'react';

import {
    Button, Card, CardActionArea, CardActions,
    CardContent, CardMedia, Grid, Typography,
    TablePagination,
    Box
} from "@material-ui/core";

export default function TxtCardContent(props) {
  
      return (
          <CardContent>
            <Box style={{maxHeight: 200, overflow: 'auto'}}>
            <Typography>{props.img_data.get('text')}</Typography>
            </Box>
            <br/>
            <Typography gutterBottom variant="h5" component="h2">
                {props.showAdvanced && ('Tags: ' + props.img_data.get('tags'))}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="div">
                <p/>
                Аккаунт: {props.img_data.get('post_account')}
                <p/>
                {props.showAdvanced ?
                    ('Time: ' + props.img_data.get('date').toISOString())
                    :
                    'Дата: ' + props.img_data.get('date').toISOString().substring(0, 10)}
                <p/>
                {props.showAdvanced && ('Negtags: ' + props.img_data.get('negtags'))}
            </Typography>
        </CardContent>
      );
  }