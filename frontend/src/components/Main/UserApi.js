import { getAccessToken, setNewAccessToken } from "../../state/State.js";
import { chatUserState } from "../../state/ChatUserState.js";
import { baseUrl } from "../../state/State.js";
import changeUrl from "../../Router.js";

export function getUserInfo(id) {
  return new Promise((resolve) => {
    const url = `${baseUrl}/api/v1/members/${id}`;

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
        } else if (data.code === 404) {
          changeUrl("/404");
        }
      })
      .catch(() => {
        changeUrl("/404");
      });
  });
}

export function postFriend(id) {
  return new Promise((resolve) => {
    const url = `${baseUrl}/api/v1/friends/${id}`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
            if (result === true) resolve(postFriend(id));
          });
        }
      });
  });
}

export async function deleteFriend(id) {
  return new Promise((resolve) => {
    const url = `${baseUrl}/api/v1/friends/${id}`;
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
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
            if (result === true) resolve(deleteFriend(id));
          });
        }
      });
  });
}

export function postBlock(id) {
  return new Promise((resolve) => {
    const url = `${baseUrl}/api/v1/block/${id}`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          console.log(data);
          resolve(chatUserState.setUserState(id, { isBlocked: true }));
        } else if (data.code === 401) {
          setNewAccessToken().then((result) => {
            if (result === true) resolve(postBlock(id));
          });
        }
      });
  });
}

export function deleteBlock(id) {
  return new Promise((resolve) => {
    const url = `${baseUrl}/api/v1/block/${id}`;
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          console.log(data);
          resolve(chatUserState.setUserState(id, { isBlocked: false }));
        } else if (data.code === 401) {
          setNewAccessToken().then((result) => {
            if (result === true) resolve(deleteBlock(id));
          });
        }
      });
  });
}
