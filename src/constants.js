const DB_NAME = "videoZilla";
const PORT = process.env.PORT || 8000;
const cookieOptions = {
  httpOnly: true,
  secure: true,
};

export { DB_NAME, PORT ,cookieOptions};
