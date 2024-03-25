import React, {Component} from "react";
import { Grid, ButtonGroup, Button, Typography } from "@mui/material";
import {Link} from "react-router-dom"
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
export default class Room extends Component {
    constructor(props) {
        super(props)
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false,
            song: {}
        }
        this.roomCode = props.match.params.roomCode
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this)
        this.updateShowSettings = this.updateShowSettings.bind(this)
        this.renderSettingsButton = this.renderSettingsButton.bind(this)
        this.getRoomDetail = this.getRoomDetail.bind(this)
        this.authenticateSpotify = this.authenticateSpotify.bind(this)
        this.getCurrentSong = this.getCurrentSong.bind(this)
        this.getRoomDetail()
        
    }
    componentDidMount() {
        this.interval = setInterval(this.getCurrentSong, 1000)
        
    }
    componentWillUnmount() {
        clearInterval(this.interval)
    }
    getRoomDetail() {
       fetch("/api/get-room" + "?code=" + this.roomCode)
       .then((response) => {
            if (!response.ok)  {
                this.props.LeaveRoomCallBack()
                this.props.history.push("/")
            }
            return response.json()
        })
       .then((data) => {
        this.setState({
                                    votesToSkip: data.votes_to_skip,
                                    guestCanPause: data.guest_can_pause,
                                    isHost: data.is_host
        })
        if (this.state.isHost) {
            this.authenticateSpotify()
            }
        })
        
    }

    getCurrentSong() {
        fetch("/spotify/current-song")
        .then((response) => {
            if (!response.ok) {
                return {}
            } else {
                return response.json()
            }
        })
        .then((data) => {
            this.setState({song: data})
            }
        )
        
    }

    authenticateSpotify() {
        fetch("/spotify/is-authenticated")
        .then((response) => response.json())
        .then(data =>  {
            this.setState({spotifyAuthenticated: data.status})
            if (!data.status) {
            fetch("/spotify/get-auth-url").then((response) => response.json()).then((data) => {window.location.replace(data.url)}
                )
        }})
    }
    leaveButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"}
        }
        fetch("/api/leave-room", requestOptions)
        .then((_response) => {
            this.props.LeaveRoomCallBack()
            this.props.history.push("/")
        })
    }
    updateShowSettings(value) {
        this.setState({showSettings: value})
    }

    renderSettingsButton() {
        return (
            <Grid item xs={12} align="center">
                <Button variant="contained" onClick={() => {this.updateShowSettings(true)}}>
                    Settings
                </Button>
            </Grid>
        )
    }

    renderSettings() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage 
                    update={true} 
                    guestCanPause={this.state.guestCanPause} 
                    votesToSkip={this.state.votesToSkip} 
                    roomCode={this.roomCode}
                    updateCallBack={this.getRoomDetail}
                    />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" Component={Link} color="secondary" onClick={() => this.updateShowSettings(false)}>
                        Close
                    </Button>
                </Grid>
            </Grid>
            
        )
    }
    render() {
        if (this.state.showSettings) {
            return this.renderSettings()
        }
        return (
                <Grid container spacing={1}>
                    <Grid item xs={12} align="center">
                        <Typography variant="h6">
                            Code: {this.roomCode}
                        </Typography>
                    </Grid>
                    <Grid item style={{margin: "auto"}}>
                        <MusicPlayer {...this.state.song}/>
                    </Grid>
                    {this.state.isHost && this.renderSettingsButton()}
                    <Grid item xs={12} align="center">
                        <Button variant="contained" Component={Link} color="secondary" onClick={this.leaveButtonPressed}>
                            Leave Room
                        </Button>
                    </Grid>
                </Grid>
                )
    }
}

