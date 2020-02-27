export default class Message {
    private id: string;
    private content: string;
    private emitter: string;
    private recepter: string;

    constructor(id: string,  content: string, emitter: string, recepter: string) {
        this.id = id;
        this.content = content;
        this.emitter = emitter;
        this.recepter = recepter;
    }


    /**
     * Getter $id
     * @return {string}
     */
	public get $id(): string {
		return this.id;
    }
    
    public isEmitterRecepterIdentical(): boolean {
        return this.emitter === this.recepter;
    }
}