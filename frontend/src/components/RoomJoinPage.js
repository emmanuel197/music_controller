import React, {Component} from 'react'
import {Grid, Typography, TextField, Button} from '@mui/material'
import {Link} from 'react-router-dom'
export default class RoomJoinPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roomCode: "",
            error: ""
        }
        this.handleRoomCodeChange = this.handleRoomCodeChange.bind(this)
        this.onButtonPressed = this.onButtonPressed.bind(this)
    }

    handleRoomCodeChange(e) {
        this.setState({roomCode: e.target.value})
    }

    onButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({code: this.state.roomCode})
        }
        fetch("/api/join-room", requestOptions)
        .then((response) => {
            if (response.ok) {
                this.props.history.push(`/room/${this.state.roomCode}`)
            } else {
                this.setState({error: "room not found!"})
            }
        }).catch((error)=> console.log(error))
    }

    render() {
        return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography variant='h4'>
                    Join a Room
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <TextField
                label="Room code"
                placeholder='ABCDEF'
                value={this.state.roomCode}
                helperText={this.state.error}
                error={this.state.error}
                onChange={this.handleRoomCodeChange}
                />
            </Grid>
            <Grid item xs={12} align="center">
                <Button variant='contained' onClick={this.onButtonPressed}>
                    Join Room
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                <Button variant='contained' color="secondary" to="/" component={Link}>
                    Back
                </Button>
            </Grid>
        </Grid>
        )
    }
}