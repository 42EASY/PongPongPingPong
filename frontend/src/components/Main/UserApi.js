import { getAccessToken, setNewAccessToken } from "../../state/State.js";
import { chatUserState } from "../../state/ChatUserState.js";

const baseUrl = "http://localhost:8000";

export async function getUserInfo(id) {
  const url = baseUrl + `/api/v1/members/${id}`;
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
    getUserInfo(id);
  }
  return json;
}

export async function postFriend(id) {
  const url = baseUrl + `/api/v1/friends/${id}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  const json = await res.json();
  if (json.code === 401) {
    setNewAccessToken();
    postFriend(id);
  }
}

export async function deleteFriend(id) {
  const url = baseUrl + `/api/v1/friends/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  const json = await res.json();
  if (json.code === 401) {
    setNewAccessToken();
    deleteFriend(id);
  }
}

export async function postBlock(id) {
  const url = baseUrl + `/api/v1/block/${id}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  const json = await res.json();
  if (json.code === 401) {
    setNewAccessToken();
    postBlock(id);
  } else if (json.code === 201) {
    chatUserState.setUserState(id, { isBlocked: true });
  }
}

export async function deleteBlock(id) {
  const url = baseUrl + `/api/v1/block/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  const json = await res.json();
  if (json.code === 401) {
    setNewAccessToken();
    deleteBlock(id);
  } else if (json.code === 200) {
    chatUserState.setUserState(id, { isBlocked: false });
  }
}
