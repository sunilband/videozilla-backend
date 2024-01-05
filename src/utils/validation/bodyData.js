const bodyDataExists = (...fields)=>{
    const res = [...fields].includes(undefined) || [...fields].some((item) => item.trim() === "");
    return res;
  }

const emailIsValid = (email) => {
  const regEx = /\S+@\S+\.\S+/;
  return regEx.test(email);
};

export {bodyDataExists,emailIsValid}