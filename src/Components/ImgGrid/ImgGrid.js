import {
    Button, Card, CardActionArea, CardActions,
    CardContent, CardMedia, Grid, Typography,
    TablePagination,
    Box
} from "@material-ui/core";
import { List } from "immutable"
import React, { useState, useEffect } from "react";
import ImageViewer from './ImageViewer'


const rowsPP = 10;

const areEqual = (prevProps, nextProps) => {
    return ((prevProps.data === nextProps.data) &&
        (prevProps.showAdvanced === nextProps.showAdvanced));
}

const ImgGrid = props => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPP);
    const [dataSlice, setDataSlice] = useState(List([]));
    const [open, setOpen] = useState(false)
    const [image, setImage] = useState(null)
    const [title, setTitle] = useState(null)

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

    const handleOpen = (img_data) => {
        const img = img_data.get('url')
        const distance = img_data.get('distance').toFixed(2)
        setOpen(true)
        setImage(img)
        setTitle("Distance " + distance)
        console.log(img)
    }

    const handleClose = () => {
        setOpen(false);
    };

    // const sliceIndices = calculateSlice(page, props.data.size, rowsPerPage)
    // setDataSlice(props.data.slice(sliceIndices.start, sliceIndices.end))

    return (
        <div>
            {pagination}
            <Grid container justify="center">
                {dataSlice.map((img_data, i) => (
                    <Grid item key={img_data.get('key')} style={{padding: 8}}>
                        {/* <Card style={{width: 400}}> */}
                        <Card style={{width: 280}}>
                            <CardActionArea onClick={() => handleOpen(img_data)}>
                                <CardMedia
                                    style={{height: 250}}
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
                            <CardActions style={{display: 'block', padding: 0}}>
                                {props.showAdvanced &&
                                <Box>
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
                            <Button size="medium"
                                    color="primary"
                                    onClick={() => props.tagClick('untag', i)}>
                                UNTAG
                            </Button>
                            <Button size="medium"
                                    color="primary"
                                    onClick={() => props.tagClick('clear', i)}>
                                CLEAR
                            </Button>
                        </Box>
                                }
                                {img_data.get('facesInFrame') === 1 &&
                                <Box>
                                    <Button size="medium"
                                            color="primary"
                                            justify="right"
                                            onClick={() => props.search(i)}>
                                        ПОИСК
                                    </Button>
                                </Box>
                                }
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {pagination}
            <ImageViewer open={open} handleClose={handleClose} image={image} title={title} />
        </div>
    )
}

export default React.memo(ImgGrid, areEqual);