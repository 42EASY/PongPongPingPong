import { getAccessToken } from "../../state/State.js";

const baseUrl = "http://localhost:8000";

export async function getUserInfo(id) {
  try {
    const url = baseUrl + `/api/v1/members/${id}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.log(error);
  }
}

export async function postFriend(id) {
  try {
    const url = baseUrl + `/api/v1/friends/${id}`;
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

export async function deleteFriend(id) {
  try {
    const url = baseUrl + `/api/v1/friends/${id}`;
    const res = await fetch(url, {
      method: "DELETE",
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

export async function postBlock(id) {
  try {
    const url = baseUrl + `/api/v1/block/${id}`;
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

export async function deleteBlock(id) {
  try {
    const url = baseUrl + `/api/v1/block/${id}`;
    const res = await fetch(url, {
      method: "DELETE",
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
