import React, { Component } from 'react';
import './App.css';
import { extent, nest, timeFormat, sum, timeDays, range } from 'd3';
import { Button, Grid, TextField, CircularProgress, Typography, IconButton, Tooltip } from '@material-ui/core';
import { List, Set, Map } from 'immutable';
import loadImage from 'blueimp-load-image';
import Papa from 'papaparse'


import TagData from './Components/TagData/TagData';
import Charts from './Components/Charts/Charts';
import Dropzone from './Components/UploadFile/Dropzone';
import CardGrid from "./Components/CardGrid/CardGrid";
import getImgsFromImg from './lukoshko/api';
import getTextsFromText from './lukoshko/textAPI'
import getTextsFromEmbed from './lukoshko/embedAPI'
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
import Box from '@material-ui/core/Box'
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import TitleIcon from '@material-ui/icons/Title';
import ImageIcon from '@material-ui/icons/Image';
import DescriptionIcon from '@material-ui/icons/Description';

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
    distinctDates: [],
    sampleConfidence: [],
    nestedSample: [],
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
    alertMessage: '',
    inputMode: 'image',
    textInput: '',
    embedInput: '',
    limit: 100,
    embedRadius: 1,
    table: 'politics',
    sampleName: '',
    sampleSize: 0,
    sampleDate: '',
    dateFilter: '',
    shuffle: false
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
        return -1
      } else {
        return 1
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
      this.setState({ alertReason: 'warning', snackbar: true, alertMessage: 'Заполните поле Tag' })
    }
  }

  tagRow = (action, index, tag = null) => {
    if (this.state.tag !== "" || tag || action === 'clear') {
      let data = this.state.data;
      let newTag;
      console.log(tag)
      console.log(this.state.tag)
      if (tag) {
        newTag = tag
      }
      else if (this.state.tag !== "") {
        newTag = this.state.tag
      }
      else if (action === 'clear') {

      }
      else {
        this.setState({ alertReason: 'warning', snackbar: true, alertMessage: 'Заполните поле Tag' })
        return;
      }
      const row = this.getUpdatedTags(action,
        this.state.pageSlice.get(index),
        newTag)
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
      if (this.state.filter) {
        this.allFilter(data.toList(), false, this.state.filter)
      }
      else {
        this.allFilter(data.toList(), true)
      }

    } else {
      if (action !== 'clear') {
        this.setState({ alertReason: 'warning', snackbar: true, alertMessage: 'Заполните поле Tag' })
      }
    }
  }

  updateFirestore = async (action, row, tagsToUpdate) => {
    let docExist = false
    let tag;
    if (Array.isArray(tagsToUpdate)) {
      console.log("TAAAAG ARRAY", tagsToUpdate)
      tag = [...tagsToUpdate]
    }
    else {
      console.log("TAAAAG STRING", tagsToUpdate)
      tag = [tagsToUpdate]
    }
    console.log("TAAAAG", tag)
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
        tags: firebase.firestore.FieldValue.arrayUnion(...tag),
        negtags: firebase.firestore.FieldValue.arrayRemove(...tag),
        modified: firebase.firestore.FieldValue.serverTimestamp(),
        ...body
      }
      console.log(docData)
      if (docExist) {
        frameRef.update(docData)
      }
      else {
        frameRef.set(docData)
      }
      rootRef.update({ tags: firebase.firestore.FieldValue.arrayUnion(...tag) })
    }
    else if (action === 'negtag') {
      const docData = {
        tags: firebase.firestore.FieldValue.arrayRemove(...tag),
        negtags: firebase.firestore.FieldValue.arrayUnion(...tag),
        modified: firebase.firestore.FieldValue.serverTimestamp(),
        ...body
      }
      console.log(docData)
      if (docExist) {
        frameRef.update(docData)
      }
      else {
        frameRef.set(docData)
      }
      rootRef.update({ negtags: firebase.firestore.FieldValue.arrayUnion(...tag) })
    }
    else if (action === 'untag') {
      const docData = {
        tags: firebase.firestore.FieldValue.arrayRemove(...tag),
        negtags: firebase.firestore.FieldValue.arrayRemove(...tag),
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
    console.log("UPDATE TAG:", row, tag)
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
    this.updateFirestore(action, row, tag)
    return row;
  }

  timeFilter = (data, interval) => {
    let startTime = this.timeScale.invert(interval[0])
    let endTime = this.timeScale.invert(interval[1])
    return data.filter(d => (d.date.getTime() >= startTime &&
      d.date.getTime() <= endTime))
  };

  dateConverter = (d) => {
    let month = d.getMonth() + 1
    if (month < 10) {
      month = '0' + month
    }
    let day = d.getDate()
    if (day < 10) {
      day = '0' + day
    }
    return `${day}.${month}.${d.getFullYear()}`
  }

  nestData = () => {
    let flatData = []
    let data = this.state.data.toList().toJS()

    //Denormalize data by tag
    data.forEach(d => d.tags.forEach(t => {
      console.log(t)
      let tmp = { ...d }
      tmp.tags = t
      // d.tags = t
      flatData.push(tmp)
    }))
    console.log("flatData", flatData)
    let dates = data.map(({ date: d }) => this.dateConverter(d))
    console.log('dates', dates)
    let distinctDates = Set(dates).toArray().sort((a, b) => new Date(a) - new Date(b))
    console.log("DISTINCT DATES", distinctDates)
    let nestedSample = nest().key(d => this.dateConverter(d.date))
      .key(d => d.tags)
      .rollup(values => sum(values, d => +1))
      .entries(flatData);
    let dateSize = nest().key(d => this.dateConverter(d.date))
      .rollup(values => sum(values, d => +1))
      .entries(data);
    console.log("nestedSample", nestedSample)
    console.log("dateSize", dateSize)
    let confidence = nestedSample.map(date => {
      let n = dateSize.filter(d => d.key === date.key).pop().value
      console.log("size", n)
      return date.values.map(tag => {
        let p = tag.value / n
        let upper = p + 1.96 * Math.sqrt((p * (1 - p) / n))
        let lower = p - 1.96 * Math.sqrt((p * (1 - p) / n))
        return {tag: tag.key, date: date.key, upper: upper, lower: lower, value: p}
      })
    })
    confidence.sort((a, b) => new Date(a[0].date) - new Date(b[0].date))
    nestedSample.sort((a,b) => new Date(a.key) - new Date(b.key))
    console.log("confidence",confidence)
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
      timeRange: timeRange,
      distinctDates: distinctDates,
      nestedSample: nestedSample,
      sampleConfidence: confidence
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

  shuffleArray(array) {
    console.log('test')
    var currentIndex = array.length,  randomIndex;
    console.log("BEFORE SHUFFLE", array)
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    console.log("AFTER SHUFFLE", array)
  
    return array;
  }

  handleFilterClick = (tag = null, date = null) => {
    if (this.state.filterAll) {
      let data = {}
      let filter = "";
      let filterDate = ""
      if (tag) {
        filter = tag
      }
      else {
        filter = this.state.filter
      }
      if (date) {
        filterDate = date
      }
      else {
        filterDate = this.state.dateFilter
      }
      console.log(filter)
      console.log(tag)
      console.log("filterDate", filterDate)
      let systemRef = firebase.firestore().collection("tagSystems").doc(this.state.currentSystem).collection("frames")
      if (filterDate.length > 0) {
        filterDate = new Date(filterDate)
        let endDate = new Date(filterDate)
        endDate.setDate(filterDate.getDate() + 1)
        systemRef = systemRef.where("date", '>=', filterDate).where("date", '<=', endDate)
        console.log("DATES", filterDate, endDate)
      }
      if (filter.length > 0) {
        systemRef.where("tags", "array-contains", filter).get().then(querySnapshot => {
          querySnapshot.forEach(doc => {
            console.log(doc.id, doc.data())
            let { tags, negtags, date, ...docData } = doc.data()
            data[doc.data().key] = Map({ tags: Set(tags), negtags: Set(negtags), date: date.toDate(), ...docData })
          })
        }).then(() => {
          console.log("DATA", data)
          data = Map(data)
          data = data.merge(this.state.data)
          if (this.state.shuffle) {
            this.allShuffle(data)
          }
          else {
            this.setState({ data: data })
            this.allFilter()
          }
        })
      }
      else {
        systemRef.get().then(querySnapshot => {
          querySnapshot.forEach(doc => {
            console.log(doc.id, doc.data())
            let { tags, negtags, date, ...docData } = doc.data()
            data[doc.data().key] = Map({ tags: Set(tags), negtags: Set(negtags), date: date.toDate(), ...docData })
          })
        }).then(() => {
          console.log("DATA", data)
          data = Map(data)
          if (this.state.shuffle) {
            console.log("DDT", data)
            this.allShuffle(data)
          }
          else {
            this.setState({ data: data })
            this.allFilter()
          }
        })
      }
    }
    else {
      this.allFilter(null, false, tag)
    }
  };

  handleTagClick = (action) => {
    this.tagAll(action);
  };

  handleRowRemoval = (action, index, tag = null) => {
    this.tagRow(action, index, tag);
  };

  handleSearchClick = (index) => {
    let data = null
    if (this.state.inputMode === 'image') {
      data = this.state.pageSlice.get(index).get('url')
      this.setState({ initialImage: data })
    }
    else if (this.state.inputMode === 'embed') {
      data = this.state.pageSlice.get(index).get('clean_sentence')
      this.setState({ embedInput: data })
    }
    this.handlePostData(data);
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
    if ((!this.state.file) && url === null && this.state.inputMode === 'image') {
      this.setState({ alertReason: 'warning', snackbar: true, alertMessage: "Выберите файл для загрузки" })
      return 0
    }
    this.setState({ spinner: true })
    console.log("Sending data")
    let data
    console.log(this.state.inputMode)
    if (this.state.inputMode === 'image') {
      const extenstion = this.state.file.name.split('.').pop();
      console.log(extenstion)
      if (extenstion === 'csv' || extenstion === 'tsv' || extenstion === 'xls') {
        data = await this.parseCsv(this.state.file)
      }
      else if (this.isInternalLink(url)) {
        data = await getImgsFromImg(this.state.APIRadius, this.state.file)
      } else {
        data = await getImgsFromImg(this.state.APIRadius, null, [url])
      }
    }
    else if (this.state.inputMode === 'embed') {
      let input;
      if (url) {
        // input = url.split(',')
        input = url
      }
      else {
        // input = this.state.embedInput.split(',')
        input = this.state.embedInput
      }
      data = await getTextsFromEmbed(this.state.embedRadius, [input], this.state.table)
      console.log(data.toJS())
    }
    else if (this.state.inputMode === 'text') {
      data = await getTextsFromText(this.state.limit, this.state.textInput, this.state.table)
      console.log(data.toJS())
    }
    if (data.size === 0) {
      // this.setState({ message: "Ничего не найдено. Попробуйте уменьшить схожесть лица." })
      this.setState({ alertReason: 'warning', snackbar: true, alertMessage: "Ничего не найдено. Попробуйте уменьшить схожесть лица." })
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

  parseCsv = (file) => {
    return new Promise(resolve => Papa.parse(file, {
      header: true,
      complete: (results) => {
        let data = {}
        results.data.forEach((d, i) => {
          let key = this.state.file.name.split('.')[0] + '_' + i
          data[key] = Map({
            key: key,
            type: 'text',
            date: new Date(d.date),
            sentence: d.sentence,
            tags: Set(d.tags.split(",")),
            negtags: ("negtags" in d) ? Set(d.negtags.split(",")) : Set([])
          })
        })
        data = Map(data)
        console.log(data.toJS())
        resolve(data)
      }
    })
    )
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
          this.setState({ alertReason: 'success', snackbar: true, alertMessage: 'Система успешно создана' })
          // console.log("Tag System successfuly created")
        }).catch(error => this.setState({ alertReason: 'error', snackbar: true, alertMessage: error.message }))
      }
      else {
        this.setState({ alertReason: 'warning', snackbar: true, alertMessage: "Имя системы не может быть 'default'" })
      }
    }
    else {
      this.setState({ alertReason: 'warning', snackbar: true, alertMessage: "Имя системы не может быть пустым" })
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
        this.setState({ alertReason: 'error', snackbar: true, alertMessage: 'Система не существует' })
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
          this.setState({ alertReason: 'success', snackbar: true, alertMessage: 'Пользователь успешно добавлен' })
        }).catch(error => this.setState({ alertReason: 'error', snackbar: true, alertMessage: error.message }))
      }
      else {
        this.setState({ alertReason: 'error', snackbar: true, alertMessage: 'Default system is private' })
      }
    }
    else {
      this.setState({ alertReason: 'warning', snackbar: true, alertMessage: "ID пользователя не может быть пустым" })
    }
  }

  addSystem = () => {
    if (this.state.addSystemId.length > 0) {
      let rootRef = firebase.firestore().collection("tagSystems").doc(this.state.addSystemId)
      rootRef.get().then(doc => {
        if (doc && doc.exists) {
          let userRef = firebase.firestore().collection("users").doc(this.context.currentUser.uid)
          userRef.update({ tagSystems: firebase.firestore.FieldValue.arrayUnion({ id: doc.id, name: doc.data().systemName }) })
            .then(() => this.setState({ alertReason: 'success', snackbar: true, alertMessage: 'Система добавлена' }))
        }
        else {
          this.setState({ alertReason: 'error', snackbar: true, alertMessage: 'Система не существует' })
        }
      }).catch(error => this.setState({ alertReason: 'error', snackbar: true, alertMessage: 'Система не существует или у Вас нет прав доступа' }))
    }
    else {
      this.setState({ alertReason: 'warning', snackbar: true, alertMessage: "ID системы не может быть пустым" })
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

  handleDateFilterChange = (event) => {
    let date = event.target.value
    this.setState({ dateFilter: date })
    // this.handleFilterClick()
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

    this.setState({ snackbar: false });
  }

  handleInputModeSwitch = (event, newMode) => {
    if (newMode !== null) {
      this.setState({ inputMode: newMode });
    }
  }

  handleTextInputChange = (event) => {
    this.setState({ textInput: event.target.value })
  }

  handleLimitChange = (event) => {
    this.setState({ limit: event.target.value })
  }

  handleEmbedInputChange = (event) => {
    this.setState({ embedInput: event.target.value })
  }

  handleEmbedRadiusChange = (event) => {
    this.setState({ embedRadius: event.target.value })
  }

  handleTableSelect = (event) => {
    this.setState({ table: event.target.value })
  }

  // copySystem = () => {
  //   let firstSystem = []
  //   let firstSystemTags = []
  //   let firstSystemNegs = []

  //   let secondSystem = []
  //   let secondSystemTags = []
  //   let secondSystemNegs = []


  //   let firstSystemRef = firebase.firestore().collection("tagSystems").doc("WE3eFAta5GnbOw6Sofkl")
  //   let secondSystemRef = firebase.firestore().collection("tagSystems").doc("Xt2fZsTR0FbPaDWzdq5t")
  //   let targetSystemRef = firebase.firestore().collection("tagSystems").doc("z1nzmjxyp6tpPqPJrPcy")

  //   firstSystemRef.get().then(doc => {
  //     firstSystemTags = doc.data().tags
  //     firstSystemNegs = doc.data().negtags
  //   })

  //   secondSystemRef.get().then(doc => {
  //     secondSystemTags = doc.data().tags
  //     secondSystemNegs = doc.data().negtags
  //   })

  //   firstSystemRef.collection("frames").get().then(snap => {
  //     snap.forEach(doc => {
  //       firstSystem.push({id: doc.id, data: doc.data()})
  //     })
  //   })
  //   .then(() => {
  //     secondSystemRef.collection("frames").get().then(snap => {
  //       snap.forEach(doc => {
  //         secondSystem.push({id: doc.id, data: doc.data()})
  //       })
  //     })
  //     .then(() => {
  //       console.log(firstSystem, secondSystem)
  //       console.log(firstSystemTags, firstSystemNegs)
  //       console.log(secondSystemTags, secondSystemNegs)
  //       targetSystemRef.update({
  //         tags: firebase.firestore.FieldValue.arrayUnion(...firstSystemTags, ...secondSystemTags), 
  //         negtags: firebase.firestore.FieldValue.arrayUnion(...firstSystemNegs, ...secondSystemNegs)
  //       })
  //       firstSystem.forEach(row => {
  //         targetSystemRef.collection("frames").doc(row.id).set(row.data)
  //       })
  //       secondSystem.forEach(row => {
  //         targetSystemRef.collection("frames").doc(row.id).set(row.data)
  //       })
  //     })
  //   })
  // }

  static contextType = AuthContext

  handleSampleNameChange = (e) => {
    this.setState({ sampleName: e.target.value })
  }

  handleSampleSizeChange = (e) => {
    this.setState({ sampleSize: e.target.value })
  }

  handleSampleDateChane = (e) => {
    this.setState({ sampleDate: e.target.value })
  }

  requestSampleButton = () => {
    console.log('test')
    if (this.state.sampleName && this.state.sampleName !== '' && this.state.sampleSize > 0) {
      firebase.firestore().collection('requests').add({
        name: this.state.sampleName,
        size: this.state.sampleSize,
        userId: this.context.currentUser.uid,
        email: this.context.currentUser.email,
        date: this.state.sampleDate
      }).then(() => {
        this.setState({ snackbar: true, alertMessage: 'Запрос выполнен', alertReason: 'success' })
      })
    }
  }

  negTagAllFrames = () => {
    let data = this.state.data;
    let negtags = this.state.allTags
    this.state.data.forEach((row, i) => {
      if (row.get("tags").size === 0) {
        console.log('no tags')
        let d = this.getUpdatedTags('negtag',
          row,
          negtags)
        data = data.set(d.get("key"), d)
      }
    })
    this.setState({ data: data })
    this.allFilter(data.toList(), true)
  }

  allShuffle = (d) => {
    let data = d
    console.log(data.toJS())
    console.log(typeof data)
    let [...keys] = data.keys()
    let shuffled = this.shuffleArray(keys)
    console.log(shuffled)
    let count = 0
    data = data.mapKeys((k) => {
      console.log(shuffled[count])
      let newKey = shuffled[count]
      count = count + 1
      return newKey
    })
    this.setState({data: data})
    this.allFilter(data.toList())
    console.log(data.toJS())
  }

  handleShuffleOptionChange = (event) => {
    this.setState({shuffle: event.target.checked})
  }

  render() {
    let charts = null;
    if (this.state.showCharts) {
      charts = <Charts
        externalToolTip={this.state.externalToolTip}
        nestedData={this.state.nestedData}
        nestedAllTags={this.state.nestedAllTags}
        nestedAllTagsDates={this.state.nestedAllTagsDates}
        timeRange={this.state.timeRange}
        distinctDates={this.state.distinctDates}
        nestedPercentData={this.state.nestedPercentData}
        slider={this.state.slider}
        handleSliderChange={this.handleSliderChange}
        handleSliderCommitted={this.handleSliderCommitted}
        handleNestDataClick={this.handleNestDataClick}
        handleExternalToolTip={this.handleExternalToolTip}
        nestedSample={this.state.nestedSample}
        sampleConfidence={this.state.sampleConfidence}
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
        handleSampleNameChange={this.handleSampleNameChange}
        handleSampleSizeChange={this.handleSampleSizeChange}
        handleSampleDateChane={this.handleSampleDateChane}
        requestSampleButton={this.requestSampleButton}
        sampleName={this.state.sampleName}
        sampleSize={this.state.sampleSize}
        sampleDate={this.state.sampleDate}
      >
        <div className="App">
          {/* <Button onClick={this.copySystem}>COPY</Button> */}
          {/* <Button onClick={() => this.allShuffle()}>Shuffle</Button> */}
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
          <Grid container justify="center" style={{ padding: 40 }}>
            <Typography>Загрузите фото интересующего вас политика (или, для шутки, вас самих), чтобы узнать, как часто тот или иной человек появлялся на ТВ.</Typography>
            <br />
            <Typography>Данные за 01.07.20 по 14.09.20 за исключением 30.08.20 и 26.08.20. Телеканал КТРК.</Typography>
          </Grid>
          <Grid container
            direction="column"
            alignItems="center"
            justify="center">
            <Box>
              <ToggleButtonGroup
                value={this.state.inputMode}
                exclusive
                size="small"
                onChange={this.handleInputModeSwitch}
                aria-label="input mode"
              >
                <ToggleButton value="image" aria-label="image">
                  <ImageIcon /><Typography style={{ paddingLeft: 5 }}>Фото</Typography>
                </ToggleButton>
                <ToggleButton value="embed" aria-label="embed">
                  <DescriptionIcon /><Typography style={{ paddingLeft: 5 }}>Эмбеддинг</Typography>
                </ToggleButton>
                <ToggleButton value="text" aria-label="text">
                  <TitleIcon /><Typography style={{ paddingLeft: 5 }}>Текст</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Grid container justify="center" style={{
              borderWidth: 3,
              borderRadius: 2,
              borderColor: '#000000',
              borderStyle: 'dashed',
              width: "auto",
              position: "relative"
            }}
            >
              {this.state.inputMode === 'image' ?
                <Box display="flex">
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
                </Box> : this.state.inputMode === 'embed' ?
                  <Box style={{ width: 600 }}>
                    <TextField
                      id="standard-multiline-static"
                      onChange={this.handleEmbedInputChange}
                      multiline
                      value={this.state.embedInput}
                      fullWidth
                      rows={15}
                      placeholder="Введите текст"
                      InputProps={{
                        disableUnderline: true
                      }}
                    />
                  </Box> :
                  <Box style={{ width: 600 }}>
                    <TextField
                      id="standard-multiline-static"
                      onChange={this.handleTextInputChange}
                      multiline
                      value={this.state.textInput}
                      fullWidth
                      rows={15}
                      placeholder="Введите текст"
                      InputProps={{
                        disableUnderline: true
                      }}
                    />
                  </Box>
              }
            </Grid>
            <br />

            <Grid container justify="center" alignItems="center">
              {this.state.inputMode === 'embed' || this.state.inputMode === 'text' ?
                <Grid item>
                  <FormControl variant="outlined" size="small" style={{ width: 100 }}>
                    <InputLabel id="select-table-label">Таблица</InputLabel>
                    <Select
                      labelId="select-table-label"
                      id="select-table"
                      value={this.state.table}
                      onChange={this.handleTableSelect}
                      label="Таблица"
                    >
                      <MenuItem value={'politics'}>politics</MenuItem>
                      <MenuItem value={'news_comments'}>news_comments</MenuItem>
                    </Select>
                  </FormControl>
                </Grid> : null}
              <Grid item style={{ padding: 8 }}>
                {this.state.inputMode === 'image' ?
                  <TextField variant="outlined"
                    id="radius"
                    size="small"
                    label="Схожесть лица"
                    value={this.state.APIRadius}
                    onChange={this.handleAPIRadiusChange} />
                  : this.state.inputMode === 'embed' ?
                    <TextField variant="outlined"
                      id="embedRadius"
                      size="small"
                      label="Схожесть текста"
                      value={this.state.embedRadius}
                      onChange={this.handleEmbedRadiusChange} />
                    :
                    <TextField variant="outlined"
                      id="limit"
                      size="small"
                      label="Кол-во предложений"
                      value={this.state.limit}
                      onChange={this.handleLimitChange} />
                }
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
                <br />
                <TextField size="small"
                  value={this.state.dateFilter}
                  type="date" onChange={this.handleDateFilterChange} />
                <br />
                <Button variant="outlined" onClick={this.handleFilterClick}>Filter</Button>
              </FormControl>
            </Grid>
          </Grid>
          {this.state.showAdvanced &&
            <Grid style={{ paddingTop: 20, paddingBottom: 10 }}>
              <TagData
                tagModeEnabled={this.state.tagModeEnabled}
                tag={this.state.tag}
                filterTag={this.state.filter}
                allTags={this.state.allTags}
                hideTags={this.state.hideTags}
                hideNegtags={this.state.hideNegtags}
                filterAll={this.state.filterAll}
                showCharts={this.state.showCharts}
                shuffle={this.state.shuffle}
                handleFilterAllChange={this.handleFilterAllChange}
                handleTagsHide={this.handleTagsHide}
                handleNegtagsHide={this.handleNegtagsHide}
                filter={this.handleFilterClick}
                handleFilterChange={this.handleFilterChange}
                handleTagTextChange={this.handleTagTextChange}
                handleTagClick={this.handleTagClick}
                handleTagModeChange={this.handleTagModeChange}
                handleShowCharts={this.handleShowCharts}
                handleShuffleOptionChange={this.handleShuffleOptionChange}
                />
              {/* <Button onClick={this.handleShowCharts}>Show charts</Button> */}
              {charts}
            </Grid>
          }

          <Grid container justify="center">{this.state.message}</Grid>
          <CardGrid data={this.state.filteredData}
            inputMode={this.state.inputMode}
            search={this.handleSearchClick}
            allTags={this.state.allTags}
            tagClick={this.handleRowRemoval}
            negTagAllFrames={this.negTagAllFrames}
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
