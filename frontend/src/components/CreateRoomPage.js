import React, {Component} from "react";
import Grid  from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button'
import {Link} from 'react-router-dom'
import {Collapse} from "@mui/material"
import {Alert} from "@mui/material"

export default class CreateRoomPage extends Component {
    static defaultProps = {
        guestCanPause: true,
        votesToSkip: 2,
        update: false,
        updateCallBack: () => {},
        roomCode: null
    }
    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            update: this.props.update,
            successMsg: "",
            errMsg: ""
        }
        this.guestCanPauseHandler = this.guestCanPauseHandler.bind(this)
        this.votesToSkipHandler = this.votesToSkipHandler.bind(this)
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this)
        this.renderCreateRoomButtons = this.renderCreateRoomButtons.bind(this)
        this.renderUpdateRoomButtons = this.renderUpdateRoomButtons.bind(this)
        this.UpdateButtonPressed = this.UpdateButtonPressed.bind(this)
    }

    guestCanPauseHandler = (e) => {
        this.setState({guestCanPause: e.target.value})
    }

    votesToSkipHandler = (e) => {
        this.setState({votesToSkip: e.target.value})
    }

    handleRoomButtonPressed = () => {
       const requestOptions = {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                            guest_can_pause: this.state.guestCanPause, 
                            votes_to_skip: this.state.votesToSkip
                        })
        }
        fetch('/api/create-room', requestOptions)
        .then((response) => response.json())
        .then((data) => this.props.history.push("/room/" + data.code))
    }

    UpdateButtonPressed() {
        const requestOptions = {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                            "guest_can_pause": this.state.guestCanPause, 
                            "votes_to_skip": this.state.votesToSkip, 
                            "code": this.props.roomCode
                        })
        }
        fetch("/api/update-room", requestOptions)
        .then((response) => {
            if (response.ok) {
                this.setState({successMsg: "Updated Successfully"})
         }  else {
                this.setState({errMsg: "Failed to Update"})
         }
            this.props.updateCallBack()
        })
        
    }
    renderCreateRoomButtons() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="primary" onClick={this.handleRoomButtonPressed}>Create A Room</Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" to="/" component={Link}>Back</Button>
                </Grid>
            </Grid>
        )
    }

    renderUpdateRoomButtons() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="primary" onClick={this.UpdateButtonPressed}>Update Room</Button>
                </Grid>
            </Grid>
        )
    }
    render() {
        const title = this.state.update ? "Update Room": "Create A Room"
        return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Collapse in={this.state.successMsg != "" || this.state.errMsg != ""}>
                    {this.state.successMsg != "" ? 
                    <Alert severity="success" onClose={() => {this.setState({successMsg: ""})}}>{this.state.successMsg}</Alert> :
                    <Alert severity="error" onClose={() => {this.setState({errMsg: ""})}}>{this.state.errMsg}</Alert>}
                </Collapse>
            </Grid> 
            <Grid item xs={12} align="center">
                <Typography variant="h4">
                    {title}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl component="feildset">
                    <FormHelperText>
                       <div align="center">Guest Control of Playback State</div> 
                    </FormHelperText>
                    <RadioGroup row defaultValue={this.state.guestCanPause} onChange={this.guestCanPauseHandler}>
                        <FormControlLabel 
                        control={<Radio color="secondary"/>}
                        value="true"
                        label="Play/Pause"
                        labelPlacement="bottom"
                        />
                        <FormControlLabel
                        label="No Control"
                        control={<Radio color="secondary"/>}
                        value="false"
                        labelPlacement="bottom"
                        />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField type="number"
                    required={true}
                    defaultValue={this.state.votesToSkip}
                    onChange={this.votesToSkipHandler}
                    InputProps={
                       {
                        min: 1,  
                        endAdornment: <InputAdornment position="end">votes</InputAdornment>}}/>
                        <FormHelperText>
                            <div align="center">
                                Votes Required To Skip Song
                            </div>
                        </FormHelperText>
                </FormControl>
            </Grid>
            {this.state.update ? this.renderUpdateRoomButtons(): this.renderCreateRoomButtons()}
        </Grid>
        )
        
    }
}
