import {v7} from "uuid";


export default function generateUUID(len:number = 12) {

    const initialUUID = v7()
    const uuidWithoutDashes = initialUUID.replace(/-/g, "")

    return uuidWithoutDashes.substring(0, len)

}