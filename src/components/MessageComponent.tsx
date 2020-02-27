import React, { Component } from 'react'
import { Alert } from 'react-bootstrap'

export default class MessageComponent extends Component <any,any> {
    render() {
        return (
            <Alert variant={this.props.message.isEmitterRecepterIdentical() ? "info" : "secondary"} key={this.props.message.$id}>
                <p>From : {this.props.message.isEmitterRecepterIdentical() ? 'Me' : this.props.message.emitter}</p>
                <p>Message : {this.props.message.content}</p>
            </Alert>
        )
    }
}