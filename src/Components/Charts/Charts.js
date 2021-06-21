import React from 'react'
import ReactEcharts from "echarts-for-react";
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import ConfidenceChart from './ConfidenceChart';

const charts = (props) => {
  console.log("distinctDates", props.distinctDates)
  console.log("nestedSample", props.nestedSample)

  let tags = new Set(props.nestedSample.map(date => date.values.map(tag => tag.key)).flat())
  tags = Array.from(tags)
  let testData = props.nestedSample.map(date => {
    console.log(date)
    return date.values.map(tag => ({ name: tag.key, data: tag.value, type: "line" }))
  })
  console.log("CHARTS TAGS", tags)
  console.log("TEST DATA", testData.flat())
  console.log(props.sampleConfidence)

  let secondTest = props.sampleConfidence.map(d => d.filter(t => t.tag === 'hate')).flat()
  console.log("secondTest", secondTest)
  return (
    <div>
      <div>{props.externalToolTip}</div>
      <ConfidenceChart tags={tags} sampleConfidence={props.sampleConfidence} />
      <ReactEcharts
        option={{

          baseOption: {
            grid: { containLabel: true },
            xAxis: [{

              type: 'category',
              data: props.distinctDates
            },],
            legend: {
            data: tags.map(t => ({name: t}))
          },
            yAxis: [{
              type: 'value',
              name: '%'
            }],
            series: tags.map(tag => (
              {
                data: props.sampleConfidence.map(d => d.filter(t => t.tag === tag).map(t => t.upper * 100)).flat(),
                type: "line",
                name: tag
              }
            ))
          }
      }}
      />
      <ReactEcharts
        option={{

          baseOption: {
            timeline: {
              //loop: false,
              axisType: 'category',
              show: true,
              autoPlay: false,
              playInterval: 300,
              data: props.distinctDates
            },
            grid: { containLabel: true },
            xAxis: [{
              type: 'value',
              name: '%'
            },],
            yAxis: [{
              type: 'category',
              inverse: true,
            }],
            series: [
              {
                type: 'bar',

              },
            ]
          },
          options:
            props.sampleConfidence.map((d) => {
              console.log("DATE", d)
              return {
                yAxis: [{
                  data: d.map(t => t.tag)
                }],
                title: {
                  text: d.map(t => t.date).pop()
                },
                series: [
                  {
                    data: d.map(t => t.lower * 100),
                    stack: true,
                    type: "bar",
                  },
                  {
                    data: d.map(t => (t.upper - t.lower) * 100),
                    type: "bar",
                    stack: true
                  },
                ]
              }
            })
          // props.nestedSample.map((date) => {
          //   console.log("DATE", date)
          //   return {
          //     yAxis: [{
          //       data: date.values
          //           .map(d => d.key)
          //     }],
          //     title: {
          //       text: date.key
          //     },
          //     series: [
          //       {
          //         data: date.values
          //           .map(d => d.value)
          //       },
          //     ]
          //   }
          // })
        }}
      />
      <ReactEcharts
        option={{
          tooltip: {
            trigger: 'axis',
            formatter: (params => {
              () => props.handleExternalToolTip("Data index: " + params[0].dataIndex)
            }),
            axisPointer: {
              animation: false
            }
          },
          legend: {
            data: ["check", "check1", "check"],/*this.state.nestedData
                  .filter(d => d.key !== "")
                  .map(d => d.key),*/
            left: 10
          },
          xAxis: {
            type: "category",
            data: props.timeRange
          },
          yAxis: {
            type: "value"
          },
          series: props.nestedData
            .filter(d => d.key !== "")
            .map(d => {
              return {
                name: d.key,
                data: d.values,
                type: "line"
              }
            })
        }}
      />
      <ReactEcharts
        option={{
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              animation: false
            }
          },
          legend: {
            data: ["check", "check1", "check"],/*this.state.nestedData
                  .filter(d => d.key !== "")
                  .map(d => d.key),*/
            left: 10
          },
          xAxis: {
            type: "category",
            data: props.timeRange
          },
          yAxis: {
            type: "value"
          },
          series: props.nestedPercentData
            .filter(d => d.key !== "")
            .map(d => {
              return {
                name: d.key,
                data: d.values,
                type: "line"
              }
            })
        }}
      />
      <ReactEcharts
        option={{

          baseOption: {
            timeline: {
              //loop: false,
              axisType: 'category',
              show: true,
              autoPlay: true,
              playInterval: 300,
              data: props.timeRange
            },
            grid: { containLabel: true },
            xAxis: [{
              type: 'value',
              name: '%',
              max: 6
            },],
            yAxis: [{
              type: 'category',
              inverse: true,
            }],
            series: [
              {
                type: 'bar',

              },
            ]
          },
          options:
            props.timeRange.map((time, time_i) => {
              return {
                yAxis: [{
                  data: props.nestedPercentData
                    .filter(d => d.key !== "")
                    .map(d => d.key)
                }],
                title: {
                  text: time
                },
                series: [
                  {
                    data: props.nestedPercentData
                      .filter(d => d.key !== "")
                      .map(d => d.values[time_i])
                  },
                ]
              }
            })
        }}
      />
      <Slider
        value={props.slider}
        onChange={props.handleSliderChange}
        onChangeCommitted={props.handleSliderCommitted}
        valueLabelDisplay="auto"
        aria-labelledby="range-slider"
      //getAriaValueText="check"
      />
      <div>
        <Button
          variant="contained"
          onClick={props.handleNestDataClick}>
          Nest Data
        </Button>
        <div>
          {JSON.stringify(props.nestedData)}
        </div>
        <div>
          {JSON.stringify(props.nestedAllTags)}
        </div>
        <div>
          {JSON.stringify(props.nestedAllTagsDates)}
        </div>
      </div>
    </div>
  )
}

export default charts