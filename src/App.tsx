import React, { Component } from 'react'
import MessageListComponent from './components/MessageListComponent';
import Message from './models/Message';
import 'bootstrap/dist/css/bootstrap.min.css';
import ConnectionActionsComponent from './components/ConnectionActionsComponent';
import { Container, Form, Button } from 'react-bootstrap'
const { client, xml } = require('@xmpp/client')
const debug = require('@xmpp/debug')

export default class App extends Component {
  xmpp = client({
    service: 'ws://212.47.241.113:5280/ws',
    domain: 'scw-happy-shirley',
    resource: 'tess',
    username: 'nico',
    password: 'pass',
  });

  state = {
    connectionStatus: '',
    presence: [],
    userId: '',
    statusText: '',
    messages: [],
    subRequests: [],
  }



  constructor(props: any) {
    super(props);
    this.setOnline = this.setOnline.bind(this);
    this.setOffline = this.setOffline.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getContactList = this.getContactList.bind(this);
    this.handleChangeStatus = this.handleChangeStatus.bind(this);
    this.subscribeRequest = this.subscribeRequest.bind(this);

    debug(this.xmpp, true)



    this.xmpp.on('error', (err: any) => {
      console.error(err)
    })

    this.xmpp.on('stanza', (stanza: any) => {
      console.log(stanza.toString())
      if (stanza.is('iq')) {
        if (stanza.attrs.type === 'result' && stanza.children && stanza.children[0].children[0] && stanza.children[0].children[0].name === 'jid') {
          this.setState({ userId: stanza.attrs.id })
        }
      }

      if (stanza.is('presence')) {
        if(stanza.attrs.to === stanza.attrs.from) {
          // Update the presence of the current user
          let presenceEvent = stanza.children.filter((element: any) => {
            return element.name === 'show';
          })
          this.setState({ presence: presenceEvent[0].children })
        }

      }

      if (stanza.is('message')) {
        this.setState(() => {
          let newMessages: Message[] = this.state.messages;

          let body = stanza.children.filter((element: any) => {
            return element.name === 'body';
          })[0];

          newMessages.push(new Message(stanza.attrs.id, body.children[0], stanza.attrs.from, stanza.attrs.to));
          return newMessages;
        }
        )
      }
    })

    this.xmpp.on('online', (address: { toString: () => any; }) => {
      this.setState({ connectionStatus: 'Connected as ' + address })
      this.getContactList()
    })

    this.xmpp.on('offline', () => {
      this.setState({ connectionStatus: 'Disconnected' })
    })
    this.xmpp.start().catch(console.error)
  }

  render() {
    return (
      <Container>
{/*         <Form>
          <Form.Control value={this.state.xmppUsername} onChange={(event: any) => {
            this.setState({ xmppUsername: event.target.value })
          }} />
          <Form.Control type="password" value={this.state.xmppPassword} onChange={(event: any) => {
            this.setState({ xmppPassword: event.target.value })
          }} />
        </Form> */}

        <p>Status : {this.state.connectionStatus}</p>
        <p>My user id : {this.state.userId}</p>
        <p>Available for : {this.state.presence.map((element) => {
          return element;
        })}</p>

        <div>
          <ConnectionActionsComponent setOnline={this.setOnline} setOffline={this.setOffline} subscribeRequest={this.subscribeRequest}/>
        </div>
        <div className="m-2">
          <Form.Control onChange={this.handleChangeStatus} />
          <Button onClick={() => this.sendMessage()}>send message</Button>
        </div>
        <div>
          <h1>Messages</h1>
          <MessageListComponent messages={this.state.messages} />
        </div>
      </Container>
    )
  }

  handleChangeStatus(event: any) {
    this.setState({ statusText: event.target.value });
  }


  async sendMessage() {
    // Sends a chat message to itself
    const message = xml('message', { type: 'chat', to: "nico@scw-happy-shirley", id: App.generateRandomId() }, xml('body', {}, this.state.statusText))
    await this.xmpp.send(message)
  }

  async setOnline() {
    await this.xmpp.send(xml('presence', { type: 'available' }, xml('show', {}, 'chat'))).catch(console.error)
  }

  async setOffline() {
    await this.xmpp.send(xml('presence', { type: 'unavailable' })).catch(console.error)
  }

  async getContactList() {
    await this.xmpp.send(xml('iq', { type: 'get', id: 'roster_1' }, xml('query', { xmlns: 'jabber:iq:roster' }, '')))
  }

  async subscribeRequest() {
    await this.xmpp.send(xml('presence', { type: 'subscribe', to: 'artandor@scw-happy-shirley' }))
  }

  static generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
