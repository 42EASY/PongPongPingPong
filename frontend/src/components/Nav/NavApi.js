import { getAccessToken, setNewAccessToken } from "../../state/State.js";
import { baseUrl } from "../../state/State.js";

export function getUserList(keyword, page, size) {
  return new Promise((resolve) => {
    const url =
      `${baseUrl}/api/v1/members/search?keyword=${keyword}&page=${page}&size=${size}`;
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
          console.log(data);
          resolve(data);
        } else if (data.code === 401) {
          setNewAccessToken().then((result) => {
            if (result === true) resolve(getUserList(keyword, page, size));
          });
        }
      });
  });
}
