import React, { Component }  from 'react';

import {
    Button, Card, CardActionArea, CardActions,
    CardContent, CardMedia, Grid, Typography,
    TablePagination,
    Box
} from "@material-ui/core";

export default function TxtCardContent(props) {
  
      return (
        <div>
            <CardMedia
            style={{height: 250}}
            image={props.img_data.get('url')}
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    {props.showAdvanced && ('Tags: ' + props.img_data.get('tags'))}
                    {/*{img_data.get('distance').toFixed(2) + " " + img_data.get('date').toISOString()}*/}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="div">
                    <p/>
                    Схожесть лица: {props.img_data.get('distance').toFixed(2)}
                    <p/>
                    {props.showAdvanced ?
                        ('Time: ' + props.img_data.get('date').toISOString())
                        :
                        'Дата: ' + props.img_data.get('date').toISOString().substring(0, 10)}
                    <p/>
                    {props.showAdvanced && ('Negtags: ' + props.img_data.get('negtags'))}
                </Typography>
            </CardContent>
        </div>
      );
  }