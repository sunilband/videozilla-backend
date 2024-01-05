const bodyDataExists = (...fields)=>{
    const res = [...fields].includes(undefined) || [...fields].some((item) => item.trim() === "");
    return res;
  }

const emailIsValid = (email) => {
  const regEx = /\S+@\S+\.\S+/;
  return regEx.test(email);
};

// Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter and one number
const passwordIsValid = (password) => {
  const regEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
  return regEx.test(password);
}

export {bodyDataExists,emailIsValid,passwordIsValid}