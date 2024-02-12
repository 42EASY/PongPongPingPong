import Friend from "./Friend.js";
import NoFriend from "./NoFriend.js";
import NoSearch from "./NoSearch.js";
import { getAccessToken, setNewAccessToken } from "../../state/State.js";

function callApi() {
  const keyword = ""; //todo: 검색 내용으로 변경
  const page = 1;
  const size = 10;
  const url = `http://localhost:8000/api/v1/friends?keyword=${keyword}&page=${page}&size=${size}`;

  fetch(url, {
    method: "GET",
    headers: {
      "content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.code === 200) {
        console.log(data);
      } else if (data.code === 401) {
        //토큰 만료
        setNewAccessToken();
        callApi();
      }
    });
}

export default function Friends() {
  const $listWrapper = document.createElement("div");
  $listWrapper.classList.add("friendsWrapper");

  //todo: api 호출
  callApi();

  const $friend = Friend();
  $listWrapper.appendChild($friend);
  const $friend1 = Friend();
  $listWrapper.appendChild($friend1);

  //친구 없을 경우
  // $listWrapper.style.flexDirection = "unset";
  // const $noFriend = NoFriend();
  // $listWrapper.appendChild($noFriend);

  //친구 검색 결과 없을 경우
  // const $noSearch = NoSearch();
  // $listWrapper.appendChild($noSearch);

  return $listWrapper;
}
