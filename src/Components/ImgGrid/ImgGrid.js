import {
    Button, Card, CardActionArea, CardActions,
    CardContent, CardMedia, Grid, Typography
} from "@material-ui/core";
import React from "react";

const areEqual = (prevProps, nextProps) => {
  return ((prevProps.data === nextProps.data) &&
      (prevProps.showAdvanced === nextProps.showAdvanced));
}

const ImgGrid = (props) => (
    <Grid container justify="center" spacing={2}>
        {props.data.map((img_data, i) => (
            <Grid item key={img_data.get('key')}>
                <Card style={{width: 400}}>
                    <CardActionArea>
                        <CardMedia
                            style={{height: 300}}
                            image={img_data.get('url')}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                {props.showAdvanced && ('Tags: ' + img_data.get('tags'))}
                                {/*{img_data.get('distance').toFixed(2) + " " + img_data.get('date').toISOString()}*/}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <p/>
                                    Схожесть лица: {img_data.get('distance').toFixed(2)}
                                <p/>
                                    {props.showAdvanced ?
                                        ('Time: ' +  img_data.get('date').toISOString())
                                        :
                                        'Дата: ' + img_data.get('date').toISOString().substring(0,10)}
                                <p/>
                                    {props.showAdvanced && ('Negtags: ' + img_data.get('negtags'))}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                    <CardActions>
                        {props.showAdvanced &&
                        <span>
                            <Button size="medium"
                                    color="primary"
                                    onClick={() => props.tagClick('tag', i)}>
                                TAG
                            </Button>
                            <Button size="medium"
                                    color="primary"
                                    onClick={() => props.tagClick('negtag', i)}>
                                NEGTAG
                            </Button>
                        </span>
                        }
                        <Button size="medium"
                                color="primary"
                                justify="right"
                                onClick={() => props.search(i)}>
                            ПОИСК
                        </Button>
                    </CardActions>
                </Card>
            </Grid>
        ))}
    </Grid>
)

export default React.memo(ImgGrid, areEqual);