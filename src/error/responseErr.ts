

export default class ResponseErr extends Error {
    responseCode: number = 500;
    details: string = 'Unknown Error';
    constructor(responseCode: number, message:string, details: string) {
        super(message);
        this.responseCode = responseCode;
        this.details = details;
    }
}