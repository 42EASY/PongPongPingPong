import { getAccessToken, setNewAccessToken } from "../../state/State.js";
import { chatUserState } from "../../state/ChatUserState.js";

const baseUrl = "http://localhost:8000";

export function getUserInfo(id) {
  return new Promise((resolve) => {
    const url = baseUrl + `/api/v1/members/${id}`;

    fetch(url, {
      method: "GET",
      headers: {
        "content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          console.log(data);
          resolve(data);
        } else if (data.code === 401) {
          setNewAccessToken().then((result) => {
            if (result === true) resolve(getUserInfo(id));
          });
        }
      });
  });
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
