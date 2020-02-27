import React, { Component } from 'react'
import {ButtonGroup, Button} from 'react-bootstrap'

export default class ConnectionActionsComponent extends Component <any, any> {
    render() {
        return (
            <ButtonGroup>
                <Button variant="success" onClick={() => this.props.setOnline()}>go online</Button>
                <Button variant="warning" onClick={() => this.props.setOffline()}>go offline</Button>
                <Button variant="info" onClick={() => this.props.subscribeRequest()}>Subscribe to artandor</Button>
            </ButtonGroup>
        )
    }
}
