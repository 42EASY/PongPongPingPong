import { getAccessToken, setNewAccessToken } from "../../state/State.js";

const baseUrl = "http://localhost:8000";

export async function getUserList(keyword, page, size) {
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
  if (json.code === 401) {
    setNewAccessToken();
    getUserList(keyword, page, size);
  }
  return json;
}
