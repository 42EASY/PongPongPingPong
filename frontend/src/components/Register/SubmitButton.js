import changeUrl from "../../Router.js";
import {
  getAccessToken,
  setIs2fa,
  setLoginState,
  setNewAccessToken,
} from "../../state/State.js";

export default function SubmitButton(text) {
  const $submitButton = document.createElement("div");
  $submitButton.classList.add("submitButton");
  $submitButton.innerHTML = text;

  function checkNickname(isDuplicate = false) {
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
    } else if (isDuplicate === true) {
      //중복된 닉네임인 경우
      nicknameError.innerHTML = "사용 중인 닉네임 입니다.";
      nicknameError.style.display = "block";
      return "";
    } else return nickname;
  }

  function getCurrent2fa() {
    const $twoFactorAuthActive = document.getElementsByClassName(
      "twoFactorAuthActive"
    )[0];
    return $twoFactorAuthActive.classList.contains("twoFactorAuthSelect");
  }

  function callApi(nickname, is2fa) {
    if (nickname === "") return;
    console.log(is2fa);

    const url = "http://localhost:8000/api/v1/members";
    const $uproadImageInput =
      document.getElementsByClassName("uproadImageInput")[0];

    const formData = new FormData();
    $uproadImageInput.files[0] !== undefined
      ? formData.append("image", $uproadImageInput.files[0])
      : "";
    formData.append(
      "data",
      JSON.stringify({
        nickname: nickname,
        is_2fa: is2fa,
      })
    );

    fetch(url, {
      method: "PATCH",
      headers: {
        // "content-Type": "multipart/form-data",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.code === 200) {
          setIs2fa(data.result.is_2fa);
          changeUrl("/main"); //todo: 메인 페이지 이동 불필요. 닉네임 에러 삭제 필요
        } else if (data.code === 409) {
          //중복된 닉네임
          checkNickname(true);
        } else if (data.code === 401) {
          //토큰 만료
          setNewAccessToken();
          callApi();
        }
      });
  }

  $submitButton.addEventListener("click", () => {
    callApi(checkNickname(), getCurrent2fa());
  });

  return $submitButton;
}
