import changeUrl from "../../Router.js";
import {
  getAccessToken,
  getNickname,
  getIs2fa,
  setIs2fa,
  setNewAccessToken,
  setNickname,
  setImage,
  baseUrl
} from "../../state/State.js";

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
  return new Promise((resolve) => {
    if (nickname === "") resolve();

    const url = `${baseUrl}/api/v1/members`;
    const $uproadImageInput =
      document.getElementsByClassName("uproadImageInput")[0];

    const data = {};
    if (nickname !== getNickname()) data.nickname = nickname;
    if (is2fa !== getIs2fa()) data.is_2fa = is2fa;

    const formData = new FormData();
    $uproadImageInput.files[0] !== undefined
      ? formData.append("image", $uproadImageInput.files[0])
      : "";
    formData.append("data", JSON.stringify(data));

    fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setIs2fa(data.result.is_2fa);
          setNickname(data.result.nickname);
          setImage(data.result.image_url);
          changeUrl("/main"); //todo: 메인 페이지 이동 불필요. 닉네임 에러 삭제 필요
          resolve();
        } else if (data.code === 409) {
          //중복된 닉네임
          resolve(checkNickname(true));
        } else if (data.code === 401) {
          //토큰 만료
          setNewAccessToken().then((result) => {
            if (result === true) resolve(callApi(nickname, is2fa));
          });
        }
      });
  });
}

export default function SubmitButton(text) {
  const $submitButton = document.createElement("div");
  $submitButton.classList.add("submitButton", "btn");
  $submitButton.innerHTML = text;

  $submitButton.addEventListener("click", () => {
    callApi(checkNickname(), getCurrent2fa());
  });

  return $submitButton;
}
