import changeUrl from "../../Router.js";
import { getAccessToken, setNewAccessToken } from "../../state/State.js";

export default function SubmitButton(text) {
  const $submitButton = document.createElement("div");
  $submitButton.classList.add("submitButton");
  $submitButton.innerHTML = text;

  function checkNickname() {
    const nickname = document.getElementsByClassName("nicknameInput")[0].value;
    const nicknameError = document.getElementsByClassName("nicknameCheck")[0];
    const regex = /^[a-zA-Z0-9가-힣]*$/;

    if (nickname === "") {
      //닉네임 입력란이 비어있는 경우
      nicknameError.innerHTML = "닉네임을 입력해주세요.";
      nicknameError.style.display = "block";
      return "";
    } else if (nickname.length > 15) {
      //닉네임이 15자를 초과하는 경우
      nicknameError.innerHTML = "15자 이내로 입력해주세요.";
      nicknameError.style.display = "block";
      return "";
    } else if (!regex.test(nickname)) {
      //닉네임이 영어, 한글, 숫자가 아닌 경우
      nicknameError.innerHTML = "영어, 한글, 숫자만 입력해주세요.";
      nicknameError.style.display = "block";
      return "";
    } else return nickname;
  }

  //todo: 계정 만들기 버튼 클릭 시 회원가입 기능 구현
  $submitButton.addEventListener("click", () => {
    const nickname = document.getElementsByClassName("nicknameInput")[0].value;
    checkNickname();

    const url = "http://localhost:8000/api/v1/members";

    fetch(url, {
      method: "PATCH",
      headers: {
        "content-Type": "multipart/form-data",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({
        image: "이미지 파일",
        data: {
          nickname: nickname,
          "2fa": false,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.code === 200) {
          changeUrl("/main");
        } else if (data.code === 409) {
          // 닉네임 중복 등 응답 처리 필요
        } else {
          //
        }
      });
  });

  return $submitButton;
}
