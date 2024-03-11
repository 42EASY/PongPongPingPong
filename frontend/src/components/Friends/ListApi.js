import { getAccessToken, setNewAccessToken } from "../../state/State.js";

export async function getFriends(keyword, page, size) {
  const url = `http://localhost:8000/api/v1/friends?keyword=${keyword}&page=${page}&size=${size}`;

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
    getFriends(keyword, page, size);
  }
  console.log(json);
  return json;
}

export async function getBlockeds(keyword, page, size) {
  const url = `http://localhost:8000/api/v1/block?keyword=${keyword}&page=${page}&size=${size}`;

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
    getBlockeds(keyword, page, size);
  }
  console.log(json);
  return json;
}
