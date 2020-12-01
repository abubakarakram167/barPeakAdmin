export const getUserData = () => {
  const userId = "one" 
  const token = localStorage.getItem('token');
  console.log("in function", token);
  return {
    userId,
    token:  token && token.replace(/^"(.+(?="$))"$/, '$1')
  }
};

export const storeUserData = async({ token, user }) => {
  console.log("here come the token", token)
  localStorage.setItem('token', token);
};