import {
    Button, Card, CardActionArea, CardActions,
    CardContent, CardMedia, Grid, Typography,
    TablePagination,
    Box
} from "@material-ui/core";
import { List } from "immutable"
import React, { useState, useEffect } from "react";
import ImageViewer from './ImageViewer'

import Content from './Content'
import ActionArea from './ActionArea'
import Actions from './Actions'

const rowsPP = 10;

const areEqual = (prevProps, nextProps) => {
    return ((prevProps.data === nextProps.data) &&
        (prevProps.showAdvanced === nextProps.showAdvanced));
}

const CardGrid = props => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPP);
    const [dataSlice, setDataSlice] = useState(List([]));
    const [open, setOpen] = useState(false)
    const [image, setImage] = useState(null)
    const [title, setTitle] = useState(null)
    const [text, setText] = useState(null)

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
        if (img_data.get('type') !== "text" && img_data.get('type') !== "embed") {
            let distance = ''
            if (img_data.get('distance')) {
                distance = img_data.get('distance').toFixed(2)
            }
            const img = img_data.get('url')
            

            setOpen(true)
            setImage(img)
            setTitle("Distance " + distance)
            setText(null)
            console.log(img)
        } 
        else {
            setTitle(img_data.get('sentence'))
            setText(img_data.get('text'))
            setImage(null)
            setOpen(true)
        }
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
                    <Grid item key={img_data.get('key')} style={{ padding: 8 }}>
                        <Card style={{ width: 280 }}>
                            <ActionArea handleOpen={handleOpen} img_data={img_data} showAdvanced={props.showAdvanced} />
                            <Content i={i} tagClick={props.tagClick} allTags={props.allTags} img_data={img_data} showAdvanced={props.showAdvanced} />
                            <Actions i={i} tagClick={props.tagClick} search={props.search} img_data={img_data} showAdvanced={props.showAdvanced} />
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {dataSlice.size > 0 && <Button onClick={props.negTagAllFrames}>Finish</Button>}
            {pagination}
            <ImageViewer open={open} handleClose={handleClose} image={image} title={title} text={text} />
        </div>
    )
}

export default React.memo(CardGrid, areEqual);