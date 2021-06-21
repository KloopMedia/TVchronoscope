import React, { useState } from 'react'
import ReactEcharts from "echarts-for-react";
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }));

const ConfidenceChart = (props) => {
    const classes = useStyles();
    const { sampleConfidence, tags } = props
    const [selectedTag, setSelectedTag] = useState(null)
    const [data, setData] = useState([])

    const handleChange = (event) => {
        setSelectedTag(event.target.value)
        let d = sampleConfidence.map(d => d.filter(t => t.tag === event.target.value)).flat()
        setData(d)
    }

    // let data = sampleConfidence.map(d => d.filter(t => t.tag === 'hate')).flat()

    console.log("CONFIDENCE DATA", data)

    return (
        <Grid>
            <FormControl className={classes.formControl}>
                <InputLabel id="demo-simple-select-label">Tag</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedTag}
                    onChange={handleChange}
                >
                    {tags.map((tag, i) => <MenuItem key={i} value={tag}>{tag}</MenuItem>)}
                </Select>
            </FormControl>
            <ReactEcharts
                option={{
                    title: {
                        text: 'Confidence Band',
                        subtext: 'Tag: ' + selectedTag,
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            animation: false,
                            label: {
                                backgroundColor: '#ccc',
                                borderColor: '#aaa',
                                borderWidth: 1,
                                shadowBlur: 0,
                                shadowOffsetX: 0,
                                shadowOffsetY: 0,

                                color: '#222'
                            }
                        },
                        formatter: function (params) {
                            return params[2].name + '<br />' + ((params[2].value) * 100).toFixed(1) + '%';
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: data.map(function (item) {
                            return item.date;
                        }),
                        axisLabel: {
                            formatter: function (value, idx) {
                                return value;
                            }
                        },
                        boundaryGap: false
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: {
                            formatter: function (val) {
                                return (val) * 100 + '%';
                            }
                        },
                        axisPointer: {
                            label: {
                                formatter: function (params) {
                                    return ((params.value) * 100).toFixed(1) + '%';
                                }
                            }
                        },
                        splitNumber: 3
                    },
                    series: [{
                        name: 'Lower',
                        type: 'line',
                        data: data.map(function (item) {
                            return item.lower;
                        }),
                        lineStyle: {
                            opacity: 0
                        },
                        stack: 'confidence-band',
                        symbol: 'none'
                    }, {
                        name: 'Upper',
                        type: 'line',
                        data: data.map(function (item) {
                            return item.upper - item.lower;
                        }),
                        lineStyle: {
                            opacity: 0
                        },
                        areaStyle: {
                            color: '#ccc'
                        },
                        stack: 'confidence-band',
                        symbol: 'none'
                    }, {
                        type: 'line',
                        data: data.map(function (item) {
                            return item.value;
                        }),
                        hoverAnimation: false,
                        symbolSize: 6,
                        itemStyle: {
                            color: '#333'
                        },
                        showSymbol: false
                    }]
                }}
            />
        </Grid>
    )
}

export default ConfidenceChart