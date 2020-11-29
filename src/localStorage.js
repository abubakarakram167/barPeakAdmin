export const getUserData = async () => {
  const userId = "one" 
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1Zjk0MWRhOWNkMDhiZjA1M2M0ODhjMmUiLCJlbWFpbCI6ImFidWJha2FyYWtyYW0xNjdAZ21haWwuY29tIiwiaWF0IjoxNjA0NzA5ODAwfQ.Dml0Mf2rHUTd9UnXDVp_yxlWyaxrdU0kGGp4AcVf82E";
  return {
    userId,
    token:  token && token.replace(/^"(.+(?="$))"$/, '$1')
  }
};