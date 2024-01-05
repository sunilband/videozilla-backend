import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    // use this for unique file name
    /* const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
        */
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
