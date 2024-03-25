import React, {Component} from 'react'
import {Grid, Typography, IconButton, Card, LinearProgress} from "@mui/material"
import {Pause, PlayArrow} from "@mui/icons-material"
import SkipNextIcon from "@mui/icons-material/SkipNext"
import '../../static/css/index.css'
export default class MusicPlayer extends Component {
    constructor(props) {
        super(props);
        // this.playSong = this.playSong.bind(this)
        // this.pauseSong = this.paus   eSong.bind(this)
    }

    playSong() {
        console.log("play")
        const requestOptions = {
            method: "PUT",
            headers: {"Content-Type": "application/json"}
        }
        fetch('/spotify/play-song', requestOptions)
    }

    pauseSong() {
        console.log("pause")
        const requestOptions = {
            method: "PUT",
            headers: {"Content-Type": "application/json"}
        }
        fetch('/spotify/pause-song', requestOptions)
    }

    skipSong() {
        console.log("skip")
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"}
        }
        fetch('/spotify/skip-song', requestOptions)
    }
    render() {
        const prog = (this.props.time / this.props.duration) * 100
        return (
            <Card >
                <Grid container alignItems="center" >
                    <Grid item style={{margin: "auto"}} xs={4}>
                        <img src={this.props.image_url} width="100%" height="100%"/>
                    </Grid>
                    <Grid item align="center" xs={8}>
                        <Typography variant='h5'>{this.props.title}</Typography>
                        <Typography variant='subtitle1' color="textSecondary">{this.props.artist}</Typography>
                         <div>
                            <IconButton onClick={ () => {this.props.is_playing ? this.pauseSong() : this.playSong()}}>
                                {this.props.is_playing ? <Pause/>: <PlayArrow/> }
                            </IconButton>
                            <IconButton>
                                {this.props.votes} / {this.props.votes_required}
                                <SkipNextIcon onClick={() => {this.skipSong()}}/>
                            </IconButton>
                        </div> 
                    </Grid>
                </Grid>
                <LinearProgress variant="determinate" value={prog}/>
            </Card>
            
        )
    }
}