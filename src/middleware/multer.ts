import Multer from "multer";


const multer = Multer({
    dest: "./uploads/",
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 
    }
})

export default multer;

