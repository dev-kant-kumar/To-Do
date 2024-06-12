import { createSlice } from "@reduxjs/toolkit";

const UserSlice = createSlice({
  name: "userinfo",
  initialState: {
    name: "",
    username: "",
    email: "",
    dateOfAccountCreation: "",
    token: "",
  },
  reducers: {
    setUserInfo(state, action) {
      const { name, username, email, date, token } = action.payload;

      (state.name = name),
        (state.username = username),
        (state.email = email),
        (state.dateOfAccountCreation = date),
        (state.token = token);
    },
  },
});

export default UserSlice.reducer;
export const { setUserInfo } = UserSlice.actions;
