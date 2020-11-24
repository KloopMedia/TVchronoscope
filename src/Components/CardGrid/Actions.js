import React, { Component } from 'react';

import {
    CardActions, Box, Button
} from "@material-ui/core";

const Content = (props) => {

    return (
        <CardActions style={{ display: 'block', padding: 0 }}>
            {props.showAdvanced &&
                <Box>
                    <Button size="medium"
                        color="primary"
                        onClick={() => props.tagClick('tag', props.i)}>
                        TAG
                    </Button>
                    <Button size="medium"
                        color="primary"
                        onClick={() => props.tagClick('negtag', props.i)}>
                        NEGTAG
                    </Button>
                    <Button size="medium"
                        color="primary"
                        onClick={() => props.tagClick('untag', props.i)}>
                        UNTAG
                    </Button>
                    <Button size="medium"
                        color="primary"
                        onClick={() => props.tagClick('clear', props.i)}>
                        CLEAR
                    </Button>
                </Box>
            }
            {(props.img_data.get('type') !== 'text' && props.img_data.get('type') !== 'embed') &&
                <Box>
                    <Button size="medium"
                        color="primary"
                        justify="right"
                        onClick={() => props.search(props.i)}>
                        ПОИСК
                    </Button>
                </Box>
            }
        </CardActions>
    );
}

export default Content