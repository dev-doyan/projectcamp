import multer from "multer"

const storage=multer.diskStorage({})  //stores uploadded files on disk

const upload=multer({
    storage:storage   //creates a multer middlewear
})

export default upload;