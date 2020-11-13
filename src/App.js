import React, { Component } from 'react';
import './App.css';
import { extent, nest, timeFormat, sum, timeDays, range } from 'd3';
import { Button, Grid, TextField, CircularProgress, Typography, IconButton, Tooltip } from '@material-ui/core';
import { List, Set, Map } from 'immutable';
import loadImage from 'blueimp-load-image';


import TagData from './Components/TagData/TagData';
import Charts from './Components/Charts/Charts';
import Dropzone from './Components/UploadFile/Dropzone';
import CardGrid from "./Components/CardGrid/CardGrid";
import getImgsFromImg from './lukoshko/api';
import Appbar from "./Components/Appbar/Appbar"

import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert'

import { AuthContext } from './util/Auth';
import firebase from './util/Firebase'


class App extends Component {

  state = {
    data: Map(),
    filteredData: List([]),
    timeFilteredData: List([]),
    tag: "",
    nestedData: [{ values: [] }],
    nestedPercentData: [{ values: [] }],
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
    showAdvanced: true,
    mergeData: false,
    message: "",
    pageSlice: null,
    currentSystem: null,
    allSystems: [],
    systemName: "",
    addSystemId: "",
    addUserId: "",
    currentSystemName: "default",
    allTags: [],
    allNegtags: [],
    filter: "",
    hideTags: false,
    hideNegtags: false,
    filterAll: true,
    snackbar: false,
    alertReason: null,
    alertMessage: ''
  }

  componentDidMount() {

    this.userListener = firebase.firestore().collection("users").doc(this.context.currentUser.uid).onSnapshot(doc => {
      this.setState({ allSystems: doc.data().tagSystems })
      doc.data().tagSystems.forEach(system => {
        if (system.name === this.state.currentSystemName) {
          this.setState({ currentSystem: system.id })
        }
      })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.currentSystem !== prevState.currentSystem) {
      console.log("CHANGED")
      this.frameListener = firebase.firestore().collection("tagSystems").doc(this.state.currentSystem).collection("frames").orderBy("modified", "desc").limit(1).onSnapshot((querySnapshot) => {
        if (!this.state.data.isEmpty()) {
          let data = this.state.data
          querySnapshot.forEach((doc) => {
            console.log(doc.data())
            let key = doc.id.replaceAll("#", "/")
            if (data.has(key)) {
              data = data.setIn([key, 'tags'], Set(doc.data().tags))
              data = data.setIn([key, 'negtags'], Set(doc.data().negtags))
            }
          });
          this.setState({ data: data })
          this.allFilter(data.toList(), true)
        }
      });
      console.log("CURRENT SYSTEM", this.state.currentSystem)
      this.systemListener = firebase.firestore().collection("tagSystems").doc(this.state.currentSystem).onSnapshot(doc => {
        if (doc.exists) {
          if (doc.data().tags) {
            this.setState({ allTags: doc.data().tags })
          }
          else {
            this.setState({ allTags: [] })
          }
          // if (doc.data().negtags) {
          //   this.setState({allNegtags: doc.data().negtags})
          // }
          // else {
          //   this.setState({allTags: []})
          // }
        }
      })
    }
    if (this.state.hideTags !== prevState.hideTags || this.state.hideNegtags !== prevState.hideNegtags) {
      this.allFilter()
    }
  }

  componentWillUnmount() {
    this.frameListener()
    this.userListener()
    this.systemListener()
  }

  excludeTagNegtag = (data) => {
    let result = data
    if (this.state.tag.length > 0) {
      result = data.filter(d => {
        if (this.state.hideTags && this.state.hideNegtags) {
          const res = !(d.get("tags").includes(this.state.tag) ||
            d.get("negtags").includes(this.state.tag))
          return res
        }
        if (this.state.hideTags) {
          const res = !(d.get("tags").includes(this.state.tag))
          return res
        }
        if (this.state.hideNegtags) {
          const res = !(d.get("negtags").includes(this.state.tag))
          return res
        }
      })
    }
    return result
  }

  allFilter = (data = null, ignoreTag = false, tag = null) => {
    let filtered = data
    let filter = ""
    if (tag) {
      filter = tag
    }
    else {
      filter = this.state.filter
    }
    if (!filtered) {
      filtered = this.state.data.toList()
    }
    if (filter.length > 0) {
      if (ignoreTag) {
        filtered = filtered.filter(d => d.get("tags"))
      } else {
        filtered = filtered.filter(d => d.get("tags").includes(filter));
      }
    }
    if (this.state.hideTags || this.state.hideNegtags) {
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
      this.setState({ data: data })
      this.allFilter(data.toList(), true)
    } else {
      this.setState({alertReason: 'warning', snackbar: true, alertMessage: 'Заполните поле Tag'})
    }
  }

  tagRow = (action, index) => {
    if (this.state.tag !== "" || action === 'clear') {
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
      if (action !== 'clear') {
        this.setState({alertReason: 'warning', snackbar: true, alertMessage: 'Заполните поле Tag'})
      }
    }
  }

  updateFirestore = async (action, row, tag) => {
    let docExist = false
    const docKey = row.get("key")
    const { tags, negtags, ...body } = row.toJS()
    let rootRef = firebase.firestore().collection("tagSystems").doc(this.state.currentSystem)
    rootRef.get().then(doc => {
      if (doc && doc.exists) {

      }
      else {
        rootRef.set({ admins: firebase.firestore.FieldValue.arrayUnion(this.context.currentUser.uid) })
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
        modified: firebase.firestore.FieldValue.serverTimestamp(),
        ...body
      }
      if (docExist) {
        frameRef.update(docData)
      }
      else {
        frameRef.set(docData)
      }
      rootRef.update({ tags: firebase.firestore.FieldValue.arrayUnion(tag) })
    }
    else if (action === 'negtag') {
      const docData = {
        tags: firebase.firestore.FieldValue.arrayRemove(tag),
        negtags: firebase.firestore.FieldValue.arrayUnion(tag),
        modified: firebase.firestore.FieldValue.serverTimestamp(),
        ...body
      }
      if (docExist) {
        frameRef.update(docData)
      }
      else {
        frameRef.set(docData)
      }
      rootRef.update({ negtags: firebase.firestore.FieldValue.arrayUnion(tag) })
    }
    else if (action === 'untag') {
      const docData = {
        tags: firebase.firestore.FieldValue.arrayRemove(tag),
        negtags: firebase.firestore.FieldValue.arrayRemove(tag),
        modified: firebase.firestore.FieldValue.serverTimestamp(),
        ...body
      }
      if (docExist) {
        frameRef.update(docData)
      }
    }
    else if (action === 'clear') {
      const docData = {
        tags: [],
        negtags: [],
        modified: firebase.firestore.FieldValue.serverTimestamp(),
        ...body
      }
      if (docExist) {
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
    } else if (action === 'untag') {
      row = row.update("tags", d => d.delete(tag))
      row = row.update("negtags", d => d.delete(tag))
    } else if (action === 'clear') {
      row = row.update("tags", d => d.clear())
      row = row.update("negtags", d => d.clear())
    }
    this.updateFirestore(action, row, this.state.tag)
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
      console.log(t)
      let tmp = {...d}
      tmp.tags = t
      // d.tags = t
      flatData.push(tmp)
    }))
    console.log("flatData", flatData)
    //Select time unit
    let day = timeFormat("%U");//timeFormat("%Y-%m-%d");
    //Determine data time extent given time unit
    let dataExtent = extent(data, d => day(d.date));
    console.log("dataExtent", dataExtent)
    let timeRange = range(dataExtent[0], dataExtent[1]);
    console.log("timeRange", timeRange)
    let nestedAllTagsDates = nest().key(d => day(d.date))
      .rollup(values => sum(values, d => +1))
      .map(flatData);
    console.log("nestedAllTagsDates", nestedAllTagsDates)
    let nestedAllTags = timeRange.map(d => nestedAllTagsDates.get(d) || 0)
    console.log("nestedAllTags", nestedAllTags)
    let nested = nest().key(d => d.tags)
      .key(d => day(d.date))
      .rollup(values => sum(values, d => +1))
      .map(flatData);
    console.log("nested", nested)

    //let timeRange = timeDays(dataExtent[0], dataExtent[1]).map(d => day(d));
    let zeroPadded = nested.keys()
      .map(d => {
        return {
          key: d,
          values: timeRange.map(t => nested.get(d).get(t) || 0)
        }
      })
    let zeroPaddedPercent = zeroPadded.map((d) => {
      return {
        key: d.key,
        values: d.values.map((t, i) => t / nestedAllTags[i] * 100)
      }
    });

    console.log("zeroPadded: ", zeroPadded)
    console.log("zeroPaddedPercent", zeroPaddedPercent)
    console.log("nestedAllTags", nestedAllTags)
    console.log("nestedAllTagsDates", nestedAllTagsDates)
    console.log("timeRange", timeRange)

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

  handleTagTextChange = (value) => {
    this.setState({
      tag: value
    });
  };

  handleFilterClick = (tag = null) => {
    if (this.state.filterAll) {
      let data = {}
      let filter = "";
      if (tag) {
        filter = tag
      }
      else {
        filter = this.state.filter
      }
      console.log(filter)
      console.log(tag)
      firebase.firestore().collection("tagSystems").doc(this.state.currentSystem).collection("frames").where("tags", "array-contains", filter).get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log(doc.id, doc.data())
          let { tags, negtags, date, ...docData } = doc.data()
          data[doc.data().key] = Map({ tags: Set(tags), negtags: Set(negtags), date: date.toDate(), ...docData })
        })
      }).then(() => {
        console.log(data)
        data = Map(data)
        data = data.merge(this.state.data)
        this.setState({ data: data })
        this.allFilter()
      })
    }
    else {
      this.allFilter(null, false, tag)
    }
  };

  handleTagClick = (action) => {
    this.tagAll(action);
  };

  handleRowRemoval = (action, index) => {
    this.tagRow(action, index);
  };

  handleSearchClick = (index) => {
    const url = this.state.pageSlice.get(index).get('url')
    this.setState({ initialImage: url })
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

  handleShowCharts = (event) => {
    // const charts = this.state.showCharts
    // console.log(charts)
    // this.setState({ showCharts: !charts })
    this.setState({ showCharts: event.target.checked })
  }

  // Photo methods start

  handleFileChange = (file) => {
    console.log(file)
    this.setState({ file: file })
  }

  handleSnackbarClick = () => {
    this.setState({ snackbarOpen: true })
  };

  setInitial = (initialImage) => {
    this.setState({ initialImage: initialImage })
  };

  handleAPIRadiusChange = (event) => {
    this.setState({ APIRadius: event.target.value })
  };

  handlePostData = async (url = null) => {
    if ((!this.state.file) && url === null) {
      this.setState({alertReason: 'warning', snackbar: true, alertMessage: "Выберите файл для загрузки"})
      return 0
    }
    this.setState({ spinner: true })
    console.log("Sending data")
    let data
    if (this.isInternalLink(url)) {
      data = await getImgsFromImg(this.state.APIRadius, this.state.file)
    } else {
      data = await getImgsFromImg(this.state.APIRadius, null, [url])
    }
    if (data.size === 0) {
      // this.setState({ message: "Ничего не найдено. Попробуйте уменьшить схожесть лица." })
      this.setState({alertReason: 'warning', snackbar: true, alertMessage: "Ничего не найдено. Попробуйте уменьшить схожесть лица."})
    } else {
      this.setState({ message: "" })
    }
    if (this.state.mergeData) {
      data = data.merge(this.state.data);
    }

    let frameRef = firebase.firestore().collection("tagSystems").doc(this.state.currentSystem).collection("frames")
    await frameRef.get().then(snapshot => {
      snapshot.forEach(doc => {
        // console.log(doc.id, " => ", doc.data());
        let key = doc.id.replaceAll("#", "/")
        if (data.has(key)) {
          // console.log("BEFORE", data.get(key).toJS())
          data = data.setIn([key, 'tags'], Set(doc.data().tags))
          data = data.setIn([key, 'negtags'], Set(doc.data().negtags))
          // console.log("AFTER", data.get(key).toJS())
        }
      })
    })

    this.setState({ data: data })
    this.allFilter(data.toList(), true)
    this.setState({ spinner: false })
  }

  // Photo methods end

  returnPageSlice = (pageSlice) => {
    this.setState({ pageSlice: pageSlice })
  }

  createTagSystem = () => {
    let rootRef = firebase.firestore().collection("tagSystems")
    if (this.state.systemName.length > 0) {
      if (this.state.systemName !== 'default') {
        rootRef.add(
          {
            systemName: this.state.systemName,
            createdBy: this.context.currentUser.email
          }
        ).then(doc => {
          let userRef = firebase.firestore().collection("users").doc(this.context.currentUser.uid)
          userRef.update({ tagSystems: firebase.firestore.FieldValue.arrayUnion({ id: doc.id, name: this.state.systemName }) })
          rootRef.doc(doc.id).collection("systemAdmins").doc(this.context.currentUser.uid).set({})
          this.setState({alertReason: 'success', snackbar: true, alertMessage: 'Система успешно создана'})
          // console.log("Tag System successfuly created")
        }).catch(error => this.setState({alertReason: 'error', snackbar: true, alertMessage: error.message}))
      }
      else {
        this.setState({alertReason: 'warning', snackbar: true, alertMessage: "Имя системы не может быть 'default'"})
      }
    }
    else {
      this.setState({alertReason: 'warning', snackbar: true, alertMessage: "Имя системы не может быть пустым"})
    }

  }

  handleSystemChange = (event) => {
    firebase.firestore().collection("tagSystems").doc(event.target.value).get().then(doc => {
      if (doc && doc.exists) {
        this.setState({ currentSystem: event.target.value })
        this.setState({ currentSystemName: doc.data().systemName })
        this.setState({ data: Map() })
        this.allFilter()
      }
      else {
        this.setState({alertReason: 'error', snackbar: true, alertMessage: 'Система не существует'})
      }
    })
  }

  handleSystemNameChange = (event) => {
    this.setState({ systemName: event.target.value })
  }

  addUserToSystem = () => {
    if (this.state.addUserId.length > 0) {
      if (this.state.currentSystemName !== 'default') {
        let rootRef = firebase.firestore().collection("tagSystems").doc(this.state.currentSystem)
        let adminsRef = rootRef.collection("systemAdmins").doc(this.state.addUserId)
        adminsRef.set({}).then(() => {
          this.setState({alertReason: 'success', snackbar: true, alertMessage: 'Пользователь успешно добавлен'})
        }).catch(error => this.setState({alertReason: 'error', snackbar: true, alertMessage: error.message}))
      }
      else {
        this.setState({alertReason: 'error', snackbar: true, alertMessage: 'Default system is private'})
      }
    }
    else {
      this.setState({alertReason: 'warning', snackbar: true, alertMessage: "ID пользователя не может быть пустым"})
    }
  }

  addSystem = () => {
    if (this.state.addSystemId.length > 0) {
      let rootRef = firebase.firestore().collection("tagSystems").doc(this.state.addSystemId)
      rootRef.get().then(doc => {
        if (doc && doc.exists) {
          let userRef = firebase.firestore().collection("users").doc(this.context.currentUser.uid)
          userRef.update({ tagSystems: firebase.firestore.FieldValue.arrayUnion({ id: doc.id, name: doc.data().systemName }) })
          .then(() => this.setState({alertReason: 'success', snackbar: true, alertMessage: 'Система добавлена'}))
        }
        else {
          this.setState({alertReason: 'error', snackbar: true, alertMessage: 'Система не существует'})
        }
      }).catch(error => this.setState({alertReason: 'error', snackbar: true, alertMessage: 'Система не существует или у Вас нет прав доступа'}))
    }
    else {
      this.setState({alertReason: 'warning', snackbar: true, alertMessage: "ID системы не может быть пустым"})
    }
  }

  handleAddSystemChange = (event) => {
    this.setState({ addSystemId: event.target.value })
  }

  handleAddUserIdChange = (event) => {
    this.setState({ addUserId: event.target.value })
  }

  handleFilterChange = (event) => {
    let tag = event.target.value
    this.setState({ filter: tag })
    this.handleFilterClick(tag)
  }

  handleTagsHide = (event) => {
    this.setState({ hideTags: event.target.checked })
  }

  handleNegtagsHide = (event) => {
    this.setState({ hideNegtags: event.target.checked })
  }

  handleFilterAllChange = (event) => {
    this.setState({ filterAll: event.target.checked })
  }

  handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({snackbar: false});
  }

  static contextType = AuthContext

  render() {

    console.log('Hakim')
    console.log(this.state.filteredData)
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
              {/* <Grid item>
                <FormControlLabel
                  control={<Switch checked={this.state.showAdvanced}
                    onChange={this.handleShowAdvancedChange} />}
                  label="Продвинутые настройки"
                />
              </Grid> */}

            </Grid>
            <Grid>
            <FormControl style={{ width: 275, margin: 8 }}>
                <InputLabel id="filter-label">Фильтр</InputLabel>
                <Select
                  IconComponent={FilterListIcon}
                  labelId="filter-label"
                  id="filter"
                  value={this.state.filter}
                  onChange={this.handleFilterChange}
                >
                  <MenuItem value="">Все</MenuItem>
                  {this.state.allTags.map((tag, i) => <MenuItem key={i} value={tag}>{tag}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {this.state.showAdvanced &&
            <Grid style={{paddingTop: 20, paddingBottom: 10}}>
              <TagData
                tagModeEnabled={this.state.tagModeEnabled}
                tag={this.state.tag}
                filterTag={this.state.filter}
                allTags={this.state.allTags}
                hideTags={this.state.hideTags}
                hideNegtags={this.state.hideNegtags}
                filterAll={this.state.filterAll}
                showCharts={this.state.showCharts}
                handleFilterAllChange={this.handleFilterAllChange}
                handleTagsHide={this.handleTagsHide}
                handleNegtagsHide={this.handleNegtagsHide}
                filter={this.handleFilterClick}
                handleFilterChange={this.handleFilterChange}
                handleTagTextChange={this.handleTagTextChange}
                handleTagClick={this.handleTagClick}
                handleTagModeChange={this.handleTagModeChange}
                handleShowCharts={this.handleShowCharts} />
              {/* <Button onClick={this.handleShowCharts}>Show charts</Button> */}
              {charts}
            </Grid>
          }

          <Grid container justify="center">{this.state.message}</Grid>
          <CardGrid data={this.state.filteredData}
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
