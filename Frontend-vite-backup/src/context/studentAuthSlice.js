import { createSlice } from "@reduxjs/toolkit";

const initialUser = null;

const studentAuthSlice = createSlice({
  name: "studentAuth",
  initialState: {
    student: initialUser,
    isAuthResolved: false,
  },
  reducers: {
    setStudentLogin: (state, action) => {
      state.student = action.payload;
      state.isAuthResolved = true;
      localStorage.setItem("devspace_student_auth", "true");
    },
    setStudentAuthResolved: (state, action) => {
      state.isAuthResolved = action.payload;
    },
    setStudentLogout: (state) => {
      state.student = null;
      state.isAuthResolved = true;
      localStorage.removeItem("devspace_student_auth");
    },
  },
});

export const { setStudentLogin, setStudentLogout, setStudentAuthResolved } = studentAuthSlice.actions;

export default studentAuthSlice.reducer;
