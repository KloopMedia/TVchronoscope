import React, { Component } from 'react';
import './App.css';
import { extent, nest, timeFormat, sum, timeDays, range } from 'd3';
import { Button, Grid, TextField, CircularProgress, Typography } from '@material-ui/core';
import { List, Set, Map } from 'immutable';
import loadImage from 'blueimp-load-image';

import Charts from './Components/Charts/Charts';
import Dropzone from './Components/UploadFile/Dropzone';
import ImgGrid from "./Components/ImgGrid/ImgGrid";
import getImgsFromImg from './lukoshko/api';
import Appbar from "./Components/Appbar/PublicAppbar"
import SearchIcon from '@material-ui/icons/Search';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert'
import Tooltip from '@material-ui/core/Tooltip'
import firebase from './util/Firebase'

class App extends Component {

  state = {
    data: Map(),
    filteredData: List([]),
    timeFilteredData: List([]),
    tag: "",
    nestedData: [{values: []}],
    nestedPercentData: [{values: []}],
    nestedAllTags: [],
    nestedAllTagsDates: {},
    timeRange: [],
    externalToolTip: "",
    tagModeEnabled: false,
    showCharts: false,
    file: null,
    snackbarOpen: false,
    initialImage: null,
    APIRadius: 0.7,
    spinner: false,
    autoDiscovery: false,
    showAdvanced: false,
    mergeData: false,
    message: "",
    pageSlice: null
  }  

  excludeTagNegtag = (data) => {
    let result = data
    console.log(data)
    if (this.state.tag.length > 0) {
      result = data.filter(d => {
        const res = !(d.get("tags").includes(this.state.tag) ||
        d.get("negtags").includes(this.state.tag))
        console.log(res)
        return res
      })
    }
    console.log(result)
    return result
  }

  allFilter = (data=null, ignoreTag=false) => {
    let filtered = data
    let tag = this.state.tag
    if (!filtered) {
      filtered = this.state.data.toList()
    }
    if (tag.length > 0) {
      if (ignoreTag) {
        filtered = filtered.filter(d => d.get("tags"))
      } else {
        filtered = filtered.filter(d => d.get("tags").includes(tag));
      }
    }
    if (this.state.tagModeEnabled) {
      filtered = this.excludeTagNegtag(filtered)
    }
    filtered = filtered.sort((a, b) => {
      const distDiff = a.get('distance') - b.get('distance')
      if (distDiff === 0) {
        return 0
      } else if (distDiff < 0) {
        return 1
      } else {
        return -1
      }
    })
    this.setState({
      filteredData: filtered
    })
  };

  tagAll = (action) => {
    if (this.state.tag !== "") {
      let data = this.state.data;
      this.state.pageSlice.forEach((row, i) => {
        let d = this.getUpdatedTags(action,
            row,
            this.state.tag)
        data = data.set(d.get("key"), d)
      })
      this.setState({data: data})
      this.allFilter(data.toList(), true)
    } else {
      alert('Fill TAG field')
    }
  }

  tagRow = (action, index) => {
    if (this.state.tag !== "") {
      let data = this.state.data;
      const row = this.getUpdatedTags(action,
          this.state.pageSlice.get(index),
          this.state.tag)
      data = data.set(row.get("key"), row)

      this.setState({
        data: data
      })
      // this.setState({
      //   filteredData: data
      // })
      // this.setState({
      //   filteredData: this.state.filteredData.delete(index)
      // })
      this.allFilter(data.toList(), true)

    } else {
      alert('Fill TAG field')
    }
  }

  updateFirestore = async (action, row, tag) => {
    let docExist = false
    const docKey = row.get("key")
    // To do: change currentUser.uid to current system id
    let rootRef = firebase.firestore().collection("tagSystems").doc(this.state.currentSystem)
    rootRef.get().then(doc => {
      if (doc && doc.exists) {

      }
      else {
        rootRef.set({admins: firebase.firestore.FieldValue.arrayUnion(this.context.currentUser.uid)})
      }
    })
    let frameRef = rootRef.collection("frames").doc(docKey.replaceAll("/", "#"))
    await frameRef.get().then(doc => {
      if (doc && doc.exists) {
        docExist = true
      }
    })

    if (action === 'tag') {
      const docData = {
        tags: firebase.firestore.FieldValue.arrayUnion(tag),
        negtags: firebase.firestore.FieldValue.arrayRemove(tag),
        modified: firebase.firestore.FieldValue.serverTimestamp()
      }
      if (docExist) {
        frameRef.update(docData)
      }
      else {
        frameRef.set(docData)
      }
      
    } else if (action === 'negtag') {
      const docData = {
        tags: firebase.firestore.FieldValue.arrayRemove(tag),
        negtags: firebase.firestore.FieldValue.arrayUnion(tag),
        modified: firebase.firestore.FieldValue.serverTimestamp()
      }
      if (docExist) {
        frameRef.update(docData)
      }
      else {
        frameRef.set(docData)
      }
    }
  }

  getUpdatedTags = (action, row, tag) => {
    if (action === 'tag') {
      row = row.update("tags", d => d.add(tag))
      row = row.update("negtags", d => d.delete(tag))
    } else if (action === 'negtag') {
      row = row.update("negtags", d => d.add(tag))
      row = row.update("tags", d => d.delete(tag))
    }
    // this.updateFirestore(action, row, this.state.tag)
    return row;
  }

  timeFilter = (data, interval) => {
    let startTime = this.timeScale.invert(interval[0])
    let endTime = this.timeScale.invert(interval[1])
    return data.filter(d => (d.date.getTime() >= startTime &&
                             d.date.getTime() <= endTime))
  };

  nestData = () => {
    let flatData = []
    let data = this.state.data.toList().toJS()

    //Denormalize data by tag
    data.forEach(d => d.tags.forEach(t => {
      d.tags = t
      flatData.push(d)
    }))

    //Select time unit
    let day = timeFormat("%U");//timeFormat("%Y-%m-%d");
    //Determine data time extent given time unit
    let dataExtent = extent(data, d => day(d.date));
    let timeRange = range(dataExtent[0], dataExtent[1]);
    let nestedAllTagsDates = nest().key(d => day(d.date))
                       .rollup(values => sum(values, d => +1))
                       .map(flatData);
    let nestedAllTags = timeRange.map(d => nestedAllTagsDates.get(d) || 0)
    let nested = nest().key(d => d.tags)
                       .key(d => day(d.date))
                       .rollup(values => sum(values, d => +1))
                       .map(flatData);

    //let timeRange = timeDays(dataExtent[0], dataExtent[1]).map(d => day(d));
    let zeroPadded = nested.keys()
                           .map(d => {
                             return {key: d,
                                     values: timeRange.map(t => nested.get(d).get(t) || 0)}})
    let zeroPaddedPercent = zeroPadded.map((d) => {
      return {
        key: d.key,
        values: d.values.map((t, i) => t/nestedAllTags[i]*100)
      }
    });

    this.setState({
      nestedData: zeroPadded,
      nestedPercentData: zeroPaddedPercent,
      nestedAllTags: nestedAllTags,
      nestedAllTagsDates: nestedAllTagsDates,
      timeRange: timeRange
    })
  }

  isInternalLink = (link) => {
    const r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return !r.test(link)
  }

  handleTagSelectorTextChange = (event) => {
    this.setState({
      tagSelector: event.target.value
    });
  };

  handleTagTextChange = (event) => {
    this.setState({
      tag: event.target.value
    });
  };

  handleFilterClick = () => {
    this.allFilter();
  };

  handleTagClick = (action) => {
    this.tagAll(action);
  };

  handleRowRemoval = (action, index) => {
    this.tagRow(action, index);
  };

  handleSearchClick = (index) => {
    const url = this.state.filteredData.get(index).get('url')
    this.setState({initialImage: url})
    this.handlePostData(url);
  };

  handleNestDataClick = () => {
    this.nestData();
  };

  handleDownloadDataClick = () => {
    this.downloadData()
  };

  handleTagModeChange = (event) => {
    this.setState({
      tagModeEnabled: event.target.checked
    });
  };

  handleAutoDiscoveryModeChange = (event) => {
    this.setState({
      autoDiscovery: event.target.checked
    });
  };

  handleShowAdvancedChange = (event) => {
    this.setState({
      showAdvanced: event.target.checked
    });
  };

  handleShowCharts = () => {
    const charts = this.state.showCharts
    console.log(charts)
    this.setState({showCharts: !charts})
  }

  // Photo methods start

  handleFileChange = (file) => {
    console.log(file)
    this.setState({file: file})
  }

  handleSnackbarClick = () => {
    this.setState({snackbarOpen: true})
  };

  setInitial = (initialImage) => {
    this.setState({initialImage: initialImage})
  };

  handleAPIRadiusChange = (event) => {
    this.setState({APIRadius: event.target.value})
  };

  handlePostData = async (url=null) => {
    if ((!this.state.file) && url===null) {
      alert("No file to upload")
      return 0
    }
    this.setState({spinner: true})
    console.log("Sending data")
    let data
    if (this.isInternalLink(url)) {
      data = await getImgsFromImg(this.state.APIRadius, this.state.file)
    } else {
      data = await getImgsFromImg(this.state.APIRadius, null, [url])
    }
    if (data.size === 0) {
      this.setState({message: "Ничего не найдено. Попробуйте уменьшить схожесть лица."})
    } else {
      this.setState({message: ""})
    }
    if (this.state.mergeData) {
      data = data.merge(this.state.data);
    }

    this.setState({data: data})
    this.allFilter(data.toList(), true)
    this.setState({spinner: false})
  }

  // Photo methods end

  returnPageSlice = (pageSlice) => {
    this.setState({pageSlice: pageSlice})
  }


  render() {
    let charts = null;
    if (this.state.showCharts) {
      charts = <Charts
        externalToolTip={this.state.externalToolTip}
        timeRange={this.state.timeRange}
        nestedData={this.state.nestedData}
        nestedAllTags={this.state.nestedAllTags}
        nestedAllTagsDates={this.state.nestedAllTagsDates}
        timeRange={this.state.timeRange}
        nestedPercentData={this.state.nestedPercentData}
        slider={this.state.slider}
        handleSliderChange={this.handleSliderChange}
        handleSliderCommitted={this.handleSliderCommitted}
        handleNestDataClick={this.handleNestDataClick}
        handleExternalToolTip={this.handleExternalToolTip}
      />
    }

    return (
      <Appbar
      showAdvanced={this.state.showAdvanced}
      currentSystem={this.state.currentSystem}
      allSystems={this.state.allSystems}
      handleShowAdvancedChange={this.handleShowAdvancedChange}
      handleSystemChange={this.handleSystemChange}
      handleSystemNameChange={this.handleSystemNameChange}
      handleAddSystemChange={this.handleAddSystemChange}
      handleAddUserIdChange={this.handleAddUserIdChange}
      createTagSystem={this.createTagSystem}
      addSystem={this.addSystem}
      addUserToSystem={this.addUserToSystem}
    >
      <div className="App">
      <Grid>
        <Snackbar 
          open={this.state.snackbar}
          autoHideDuration={6000}
          onClose={this.handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={this.handleCloseSnackbar} severity={this.state.alertReason} variant="filled">
            {this.state.alertMessage}
          </Alert>
        </Snackbar>
      </Grid>
      <Grid container justify="center" style={{padding: 40}}>
        <Typography>Загрузите фото интересующего вас политика (или, для шутки, вас самих), чтобы узнать, как часто тот или иной человек появлялся на ТВ.</Typography>
        <br />
        <Typography>Данные за 01.07.20 по 14.09.20 за исключением 30.08.20 и 26.08.20. Телеканал КТРК.</Typography>
      </Grid>
        <Grid container
          direction="column"
          alignItems="center"
          justify="center">
          <Grid container justify="center" style={{
            borderWidth: 3,
            borderRadius: 2,
            borderColor: '#000000',
            borderStyle: 'dashed',
            width: "auto",

          }}
          >
            <Dropzone handleChange={this.handleFileChange}
              handleClick={this.handleSnackbarClick}
              setImage={this.setInitial} />
            {this.state.initialImage ?
              <img src={this.state.initialImage}
                alt="initial_image"
                style={{ height: 300 }} />
              :
              <Grid style={{ width: 300, borderLeft: '3px dashed black', }}></Grid>
            }
          </Grid>
          <br />
          
          <Grid container justify="center" alignItems="center">
            <Grid item style={{ padding: 8 }}>
              <TextField variant="outlined"
                id="radius"
                size="small"
                label="Схожесть лица"
                value={this.state.APIRadius}
                onChange={this.handleAPIRadiusChange} />
            </Grid>
            <Grid item>
              <Tooltip title="Найти похожие лица" placement="top">
                <Button variant="contained" style={{ background: 'green' }}
                  // size="small"
                  onClick={() => this.handlePostData(this.state.initialImage)}>
                  <SearchIcon style={{ fill: "white" }} />
                </Button>
              </Tooltip>
            </Grid>
            <Grid item style={{ padding: 8 }}>
              {this.state.spinner ?
                <CircularProgress size={32} style={{ color: 'grey' }} />
                :
                null
              }
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center">{this.state.message}</Grid>
        <ImgGrid data={this.state.filteredData}
          search={this.handleSearchClick}
          tagClick={this.handleRowRemoval}
          showAdvanced={this.state.showAdvanced}
          returnRowsPerPage={this.returnRowsPerPage}
          returnCurrentPage={this.returnCurrentPage}
          returnPageSlice={this.returnPageSlice}
        />
      </div>
    </Appbar>
    );
  }
}

export default App;