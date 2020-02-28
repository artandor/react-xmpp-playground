const {client, xml} = require('@xmpp/client');
//const debug = require('@xmpp/debug');

export class XmppService {
    get xmpp(): any {
        return this._xmpp;
    }

    private _xmpp: any;
    private username: string;
    private password: string;
    private resource: string;

    constructor(username: string, password: string, resource: string) {
        this.username = username + '@scw-happy-shirley';
        this.password = password;
        this.resource = resource;
    }

    initConnection() {
        if (this._xmpp == null) {
            this._xmpp = client({
                service: 'ws://212.47.241.113:5280/ws',
                domain: 'scw-happy-shirley',
                resource: this.resource,
                username: this.username,
                password: this.password,
            });
        }
    }

    async sendMessage(messageText: string, dest: string) {
        // Sends a chat message to itself
        const message = xml('message', {
            type: 'chat',
            to: dest,
            id: XmppService.generateRandomId()
        }, xml('body', {}, messageText));
        await this.xmpp.send(message)
    }

    public connect() {
        this.initConnection();
        if (this._xmpp !== null) {
            if (this._xmpp !== undefined) {
                //debug(this.xmpp, true)
                this._xmpp.start().catch(console.error)
            }
        }
    }

    static generateRandomId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}
