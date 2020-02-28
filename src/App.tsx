import React, {Component} from 'react'
import MessageListComponent from './components/MessageListComponent';
import Message from './models/Message';
import 'bootstrap/dist/css/bootstrap.min.css';
import ConnectionActionsComponent from './components/ConnectionActionsComponent';
import {Container, Form, Button, InputGroup, FormControl, Row, Col} from 'react-bootstrap'
import {XmppService} from "./services/XmppService";

const {xml} = require('@xmpp/client')


export default class App extends Component {
    xmppService!: XmppService;

    state = {
        connectionStatus: '',
        presence: [],
        userId: '',
        statusText: '',
        messages: [],
        subRequests: [],
        xmppUsername: '',
        xmppPassword: '',
    }


    constructor(props: any) {
        super(props);
        this.setOnline = this.setOnline.bind(this);
        this.setOffline = this.setOffline.bind(this);
        this.getContactList = this.getContactList.bind(this);
        this.handleChangeStatus = this.handleChangeStatus.bind(this);
        this.subscribeRequest = this.subscribeRequest.bind(this);

    }

    render() {
        return (
            <Container>
                <Form>
                    <Row>
                        <Col xs={"5"}>
                            <InputGroup>
                                <FormControl value={this.state.xmppUsername} onChange={(event: any) => {
                                    this.setState({xmppUsername: event.target.value})
                                }}/>
                                <InputGroup.Append>
                                    <InputGroup.Text>@scw-happy-shirley</InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>
                        </Col>
                        <Col>
                            <InputGroup>
                                <FormControl type="password" value={this.state.xmppPassword} onChange={(event: any) => {
                                    this.setState({xmppPassword: event.target.value})
                                }}/>
                            </InputGroup>
                        </Col>
                        <Col xs={"2"}>
                            <Button variant="secondary"  onClick={() => {
                                this.xmppConnect();
                            }}>Connect to server</Button>
                        </Col>
                    </Row>
                </Form>

                <p>Status : {this.state.connectionStatus}</p>
                <p>My user id : {this.state.userId}</p>
                <p>Available for : {this.state.presence.map((element) => {
                    return element;
                })}</p>

                <div>
                    <ConnectionActionsComponent setOnline={this.setOnline} setOffline={this.setOffline}
                                                subscribeRequest={this.subscribeRequest}/>
                </div>
                <div className="m-2">
                    <Form onSubmit={(event: any) => {
                        this.xmppService.sendMessage(this.state.statusText, "nico@scw-happy-shirley");
                        event.preventDefault();
                    }}>
                        <Form.Control onChange={this.handleChangeStatus}/>
                        <Button type="submit">send message</Button>
                    </Form>
                </div>
                <div>
                    <h1>Messages</h1>
                    <MessageListComponent messages={this.state.messages}/>
                </div>
            </Container>
        )
    }

    handleChangeStatus(event: any) {
        this.setState({statusText: event.target.value});
    }

    async setOnline() {
        await this.xmppService.xmpp.send(xml('presence', {type: 'available'}, xml('show', {}, 'chat'))).catch(console.error)
    }

    async setOffline() {
        await this.xmppService.xmpp.send(xml('presence', {type: 'unavailable'})).catch(console.error)
    }

    async getContactList() {
        await this.xmppService.xmpp.send(xml('iq', {
            type: 'get',
            id: 'roster_1'
        }, xml('query', {xmlns: 'jabber:iq:roster'}, '')))
    }

    async subscribeRequest() {
        await this.xmppService.xmpp.send(xml('presence', {type: 'subscribe', to: 'artandor@scw-happy-shirley'}))
    }

    xmppConnect() {
        this.xmppService = new XmppService(this.state.xmppUsername, this.state.xmppPassword, 'test')
        this.xmppService.initConnection();

        this.xmppService.xmpp.on('error', (err: any) => {
            console.error(err)
        });

        this.xmppService.xmpp.on('stanza', (stanza: any) => {
            console.log(stanza.toString());
            if (stanza.is('iq')) {
                if (stanza.attrs.type === 'result' && stanza.children && stanza.children[0].children[0] && stanza.children[0].children[0].name === 'jid') {
                    this.setState({userId: stanza.attrs.id})
                }
            }

            if (stanza.is('presence')) {
                if (stanza.attrs.to === stanza.attrs.from) {
                    // Update the presence of the current user
                    let presenceEvent = stanza.children.filter((element: any) => {
                        return element.name === 'show';
                    });
                    this.setState({presence: presenceEvent[0].children})
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
        });

        this.xmppService.xmpp.on('online', (address: { toString: () => any; }) => {
            this.setState({connectionStatus: 'Connected as ' + address});
            this.getContactList()
        });

        this.xmppService.xmpp.on('offline', () => {
            this.setState({connectionStatus: 'Disconnected'})
        });

        this.xmppService.connect()
    }
}
