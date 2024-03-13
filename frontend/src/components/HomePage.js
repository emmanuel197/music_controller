import React, { Component } from "react";
import CreateRoomPage from "./CreateRoomPage.js";
import RoomJoinPage from "./RoomJoinPage.js";
import Room from "./Room.js"
import { Button, ButtonGroup, Typography, Grid } from "@mui/material";
import {Link} from 'react-router-dom'

import {
    BrowserRouter,
    Switch,
    Route,
    Redirect
  } from 'react-router-dom'

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: null
        }
        this.renderHomePage = this.renderHomePage.bind(this)
        this.clearRoomCode = this.clearRoomCode.bind(this)
    }
    clearRoomCode() {
        this.setState(
            {roomCode: null}
            )
    }
    async componentDidMount() {
        fetch("/api/user-in-room")
        .then((response) => response.json())
        .then((data) => this.setState({roomCode: data.room_code})) 
    }
    renderHomePage() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} align="center">
                    <Typography variant="h3">House Party</Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <ButtonGroup>
                        <Button variant="contained" to="/join" component={Link}>
                            Join a Room
                        </Button>
                        <Button variant="contained" color="secondary" to="/create" component={Link}>
                            Create a Room
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        )
    }
    render() {
        return  (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" render={() => {
                        return this.state.roomCode ? 
                        (<Redirect to={`/room/${this.state.roomCode}`}/>) : this.renderHomePage()
                    }}>
                       
                    </Route>
                    <Route path="/join" component={RoomJoinPage} />
                    <Route path="/create" component={CreateRoomPage} />
                    <Route path="/room/:roomCode" render={(props) => {
                        return <Room {...props} LeaveRoomCallBack={this.clearRoomCode}/>
                    }}/>
                </Switch>
            </BrowserRouter>
        )
    }
}