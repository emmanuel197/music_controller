import {render} from 'react-dom'
import React, {Component} from 'react'
import HomePage from './HomePage.js';


export default class App extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
                <div className='center'>
                    <HomePage/>
                </div>
        )
}
}



render(<App />, document.getElementById('app'))