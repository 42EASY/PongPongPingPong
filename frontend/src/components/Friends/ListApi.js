import { getAccessToken, setNewAccessToken } from "../../state/State.js";
import { baseUrl } from "../../state/State.js";

export function getFriends(keyword, page, size) {
  return new Promise((resolve) => {
    const url = `${baseUrl}/api/v1/friends?keyword=${keyword}&page=${page}&size=${size}`;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          resolve(data);
        } else if (data.code === 401) {
          setNewAccessToken().then((result) => {
            if (result === true) resolve(getFriends(keyword, page, size));
          });
        }
      });
  });
}

export function getBlockeds(keyword, page, size) {
  return new Promise((resolve) => {
    const url = `${baseUrl}/api/v1/block?keyword=${keyword}&page=${page}&size=${size}`;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          resolve(data);
        } else if (data.code === 401) {
          setNewAccessToken().then((result) => {
            if (result === true) resolve(getBlockeds(keyword, page, size));
          });
        }
      });
  });
}
