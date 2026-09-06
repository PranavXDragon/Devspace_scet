import axiosInstance from "./axiosInstance";

class StudentService {
  async loginStudent(email) {
    return axiosInstance.post("/students/login", { email });
  }

  async verifyStudentOtp(email, otp) {
    return axiosInstance.post("/students/verify-otp", { email, otp });
  }

  async logoutStudent() {
    return axiosInstance.post("/students/logout");
  }

  async getDashboardData() {
    return axiosInstance.get("/students/dashboard");
  }
}

export const studentService = new StudentService();
export default StudentService;
