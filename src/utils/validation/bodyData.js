const bodyDataExists = (...fields) => {
  const res =
    [...fields].includes(undefined) ||
    [...fields].some((item) => item.trim() === "");
  return res;
};

const emailIsValid = (email) => {
  const regEx = /\S+@\S+\.\S+/;
  return regEx.test(email);
};

// Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter and one number
const passwordIsValid = (password) => {
  // Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter and one number and optionally one special character
  const regEx =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return regEx.test(password);
};

export { bodyDataExists, emailIsValid, passwordIsValid };
