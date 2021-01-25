import React, { Component } from 'react';

import {

    CardContent, Grid, Typography,
    Box
} from "@material-ui/core";

const Content = (props) => {

    const type = props.img_data.get('type')
    console.log(props.img_data.get('distance'))

    return (
        <CardContent>
            <Box>
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
                {/* <Typography variant="body2" color="textSecondary" component="div">
                    {props.showAdvanced ?
                        ('Time: ' + props.img_data.get('date').toISOString())
                        :
                        'Дата: ' + props.img_data.get('date').toISOString().substring(0, 10)}
                </Typography> */}
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