import axiosInstance from "./axiosInstance";

class TeamService {
  async getTeamMembers(params = {}) {
    return axiosInstance.get("/team-roster", { params });
  }

  async addTeamMember(formData) {
    return axiosInstance.post("/team-roster", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async deleteTeamMember(id) {
    return axiosInstance.delete(`/team-roster/${id}`);
  }

  async updateTeamMember(id, formData) {
    return axiosInstance.patch(`/team-roster/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
}

export const teamService = new TeamService();
export default TeamService;
