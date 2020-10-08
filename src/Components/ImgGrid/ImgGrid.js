import {
    Button, Card, CardActionArea, CardActions,
    CardContent, CardMedia, Grid, Typography,
    TablePagination
} from "@material-ui/core";
import { List } from "immutable"
import React, { useState, useEffect } from "react";

const rowsPP = 10;

const areEqual = (prevProps, nextProps) => {
    return ((prevProps.data === nextProps.data) &&
        (prevProps.showAdvanced === nextProps.showAdvanced));
}

const ImgGrid = props => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPP);
    const [dataSlice, setDataSlice] = useState(List([]));

    const calculateSlice = (pageNumber, rowsPage, data) => {
        const numberOfPages = Math.floor(data.size / rowsPage) + 1;
        console.log("numberOfPages", numberOfPages);
        const start = pageNumber * rowsPage;
        let end = data.size
        if (pageNumber !== numberOfPages - 1) {
            end = (pageNumber + 1) * rowsPage;
        }
        console.log("Start", start);
        console.log("End", end);
        return data.slice(start, end)
    }

    const handleChangePage = (event, newPage) => {
        setDataSlice(calculateSlice(newPage, rowsPerPage, props.data));
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setPage(0);
        setRowsPerPage(event.target.value);
        setDataSlice(calculateSlice(0, event.target.value, props.data));
    };

    useEffect(() => {
        // Update the document title using the browser API
        setDataSlice(calculateSlice(page, rowsPP, props.data));
    }, [props.data]);


    useEffect(() => {
        props.returnPageSlice(dataSlice)
    }, [dataSlice])

    const pagination = props.data.size > 0 && (
        <TablePagination
            justify="center"
            component="div"
            count={props.data.size}
            page={page}
            onChangePage={handleChangePage}
            rowsPerPage={rowsPerPage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
        />
    )

    // const sliceIndices = calculateSlice(page, props.data.size, rowsPerPage)
    // setDataSlice(props.data.slice(sliceIndices.start, sliceIndices.end))

    return (
        <div>
            {pagination}
            <Grid container justify="center" spacing={2}>
                {dataSlice.map((img_data, i) => (
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
                                            ('Time: ' + img_data.get('date').toISOString())
                                            :
                                            'Дата: ' + img_data.get('date').toISOString().substring(0, 10)}
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
                                {img_data.get('facesInFrame') === 1 &&
                                <Button size="medium"
                                        color="primary"
                                        justify="right"
                                        onClick={() => props.search(i)}>
                                    ПОИСК
                                </Button>
                                }
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {pagination}
        </div>
    )
}

export default React.memo(ImgGrid, areEqual);