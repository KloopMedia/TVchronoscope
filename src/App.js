import React, { Component } from 'react';
import './App.css';
import { extent, nest, timeFormat, sum, timeDays, range } from 'd3';
import { Button, Grid, TextField, CircularProgress } from '@material-ui/core';
import { List, Set, Map } from 'immutable';
import loadImage from 'blueimp-load-image';


import TagData from './Components/TagData/TagData';
import Charts from './Components/Charts/Charts';
import Dropzone from './Components/UploadFile/Dropzone';
import ImgGrid from "./Components/ImgGrid/ImgGrid";
import getImgsFromImg from './lukoshko/api';

import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { AuthContext } from './util/Auth';
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
    showAdvanced: true,
    mergeData: false,
    message: "",
    pageSlice: null,
    currentSystem: this.context.currentUser.uid,
    allSystems: [],
    systemName: "",
    userEmail: "",
    currentSystemName: "default"
  }  
  
  componentDidMount() {
    this.userListener = firebase.firestore().collection("users").doc(this.context.currentUser.uid).onSnapshot(doc => {
      this.setState({allSystems: doc.data().tagSystems})
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
          this.setState({data: data})
          this.allFilter(data.toList(), true)
        }
      });
    }
  }

  componentWillUnmount() {
    this.frameListener()
    this.userListener()
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

    // To do: change currentUser.uid to current system id
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

    this.setState({data: data})
    this.allFilter(data.toList(), true)
    this.setState({spinner: false})
  }

  // Photo methods end

  returnPageSlice = (pageSlice) => {
    this.setState({pageSlice: pageSlice})
  }

  createTagSystem = () => {
    let rootRef = firebase.firestore().collection("tagSystems")
    if (this.state.systemName.length > 0) {
      rootRef.add(
        {
          systemName: this.state.systemName,
          createdBy: this.context.currentUser.email,
          admins: firebase.firestore.FieldValue.arrayUnion(this.context.currentUser.uid),
        }
      ).then(doc => {
        let userRef = firebase.firestore().collection("users").doc(this.context.currentUser.uid)
        userRef.update({tagSystems: firebase.firestore.FieldValue.arrayUnion({id: doc.id, name: this.state.systemName})})
        console.log("Tag System successfuly created")
      })
    }
    else {
      alert("System name cannot be empty!")
    }
    
  }

  handleSystemChange = (event) => {
    firebase.firestore().collection("tagSystems").doc(event.target.value).get().then(doc => {
      if (doc && doc.exists) {
        this.setState({currentSystem: event.target.value})
        this.setState({currentSystemName: doc.data().systemName})
      }
      else {
        alert("System doesn't exist")
      }
    })
  }

  handleSystemNameChange = (event) => {
    this.setState({systemName: event.target.value})
  }

  addUserToSystem = () => {
    firebase.firestore().collection("users").where("email", "==", this.state.userEmail).get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
          if (doc && doc.exists) {
            if (this.state.currentSystem !== this.context.currentUser.uid) {
              firebase.firestore().collection("messages").doc(doc.id).collection("invites").add({
                systemId: this.state.currentSystem,
                systemName: this.state.currentSystemName,
                fromUser: this.context.currentUser.email
              })
            }
            else {
              alert("Default system is private")
            }
          }
          else {
            alert("User doesn't exist")
          }
      });
  })
  }

  handleEmailChange = (event) => {
    this.setState({userEmail: event.target.value})
  }

  static contextType = AuthContext

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
        <div className="App">
          <FormControl style={{minWidth: 120}}>
            <InputLabel id="select-system">System</InputLabel>
            <Select
              labelId="select-system"
              id="select-system"
              value={this.state.currentSystem}
              onChange={this.handleSystemChange}
            >
            {this.state.allSystems.map(system => {
              return <MenuItem value={system.id}>{system.name}</MenuItem>
            })}
            </Select>
          </FormControl>
          {this.context.currentUser
              ? <Button style={{ position: 'absolute', right: '1%', top: '2%' }} size="small" variant="outlined" onClick={() => firebase.auth().signOut()}>
                выход
          </Button>
              : null
          }
          <Grid container
                direction="column"
                alignItems="center"
                justify="center">
            <Grid container justify="center">
              <Dropzone handleChange={this.handleFileChange}
                        handleClick={this.handleSnackbarClick}
                        setImage={this.setInitial}/>
            </Grid>
            <Grid container justify="center">
              {this.state.initialImage ?
                  <img src={this.state.initialImage}
                       alt="initial_image"
                       style={{height: 300}}/>
                  :
                  null
              }
            </Grid>
            <p />
            <Grid container>
              <Grid item>
                <TextField placeholder="Enter system's name" onChange={this.handleSystemNameChange} />
              </Grid>
              <Grid item>
                <Button onClick={this.createTagSystem}>Create Tag System</Button>
              </Grid>
            </Grid>
            <Grid>
            <Grid item>
                <TextField placeholder="Enter user's email" onChange={this.handleEmailChange} />
              </Grid>
              <Grid item>
                <Button onClick={this.addUserToSystem}>Add user</Button>
              </Grid>
            </Grid>
            <Grid container justify="center" spacing={2}>
              <Grid item>
              <TextField variant="outlined"
                         id="radius"
                         size="small"
                         label="Схожесть лица"
                         value={this.state.APIRadius}
                         onChange={this.handleAPIRadiusChange}/>
              </Grid>
              <Grid item>
              <Button variant="contained"
                      size="small"
                      onClick={() => this.handlePostData(this.state.initialImage)}>Найти похожие лица</Button>
              </Grid>
              <Grid item>
                {this.state.spinner ?
                    <CircularProgress size={32} style={{color: 'grey'}}/>
                    :
                    null
                }
              </Grid>
              {/*<Grid item>*/}
              {/*  <FormControlLabel*/}
              {/*      control={<Switch checked={this.state.showAdvanced}*/}
              {/*                       onChange={this.handleShowAdvancedChange}/>}*/}
              {/*      label="Продвинутые настройки"*/}
              {/*  />*/}
              {/*</Grid>*/}

            </Grid>
          </Grid>
          <p />
          {this.state.showAdvanced &&
            <div>
              <TagData justify="center"
                       tagModeEnabled={this.state.tagModeEnabled}
                       tag={this.state.tag}
                       filter={this.handleFilterClick}
                       handleTagTextChange={this.handleTagTextChange}
                       handleTagClick={this.handleTagClick}
                       handleTagModeChange={this.handleTagModeChange}/>
              <Button onClick={this.handleShowCharts}>Show charts</Button>
              {charts}
            </div>
          }

          <div justify="center">{this.state.message}</div>
          <p />
          <ImgGrid data={this.state.filteredData}
                   search={this.handleSearchClick}
                   tagClick={this.handleRowRemoval}
          showAdvanced={this.state.showAdvanced}
          returnRowsPerPage={this.returnRowsPerPage}
          returnCurrentPage={this.returnCurrentPage}
          returnPageSlice={this.returnPageSlice}
          />
        </div>
    );
  }
}

export default App;
