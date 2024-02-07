import { getAccessToken } from "../../state/State.js";

const baseUrl = "http://localhost:8000";

export async function getUserList(keyword, page, size) {
  try {
    const url =
      baseUrl +
      `/api/v1/members/search?keyword=${keyword}&page=${page}&size=${size}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.log(error);
  }
}

export async function postLogout() {
  try {
    const url = baseUrl + `/api/v1/auth/logout`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    await res.json();
  } catch (error) {
    console.log(error);
  }
}
