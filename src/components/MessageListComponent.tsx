import React, { Component } from 'react'
import MessageComponent from './MessageComponent'
import Message from '../models/Message'

export default class MessageListComponent extends Component <any>{
    render() {
        return (
            <>
                {this.props.messages.map((message: Message) => {
                    return <MessageComponent key={message.$id} message={message} />
                })}
            </>
        )
    }
}
