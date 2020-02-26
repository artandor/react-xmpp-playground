import React, { Component } from 'react'
const { client, xml, jid } = require('@xmpp/client')
const debug = require('@xmpp/debug')

export default class App extends Component {

  xmpp = client({
    service: 'ws://212.47.241.113:5280/ws',
    domain: 'scw-happy-shirley',
    resource: 'marco',
    username: 'nico',
    password: 'pass',
  })

  constructor(props: any) {
    super(props);
    this.setOnline = this.setOnline.bind(this);
    this.setOffline = this.setOffline.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    debug(this.xmpp, true)

    

    this.xmpp.on('error', (err: any) => {
      console.error(err)
    })

    this.xmpp.on('stanza', (stanza: { toString: () => any; is: (arg0: string) => any; clone: () => any; attrs: { from: any; }; }) => {
      console.log(stanza.toString())
      if(stanza.is('presence')) {
        console.log('update presence')
      }
    })

    this.xmpp.on('online', (address: { toString: () => any; }) => {
      this.setState({connectionStatus: 'Connected as ' + address})
    })

    this.xmpp.on('offline', () => {
      this.setState({connectionStatus: 'Disconnected'})
    })

    this.xmpp.start().catch(console.error)
  }

  state = {
    connectionStatus: '',
  }

  render() {
    return (
      <div>
        <p>Status : {this.state.connectionStatus}</p>
        <button onClick={() => this.sendMessage()}>send message</button>
        <button onClick={() => this.setOnline()}>go online</button>
        <button onClick={() => this.setOffline()}>go offline</button>
      </div>
    )
  }


  async sendMessage() {
    // Sends a chat message to itself
    const message = xml('message', { type: 'chat', to: "nico@scw-happy-shirley"}, xml('body', {}, 'hello world'))
    await this.xmpp.send(message).catch(console.error)
  }

  async setOnline() {
    console.log('set presence to on')
    await this.xmpp.send(xml('presence',{type: 'available'})).catch(console.error)
  }

  async setOffline() {
    console.log('set presence to off')
    await this.xmpp.send(xml('presence', { type: 'unavailable' })).catch(console.error)
  }
}
