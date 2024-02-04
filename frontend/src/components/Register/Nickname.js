export default function Nickname(nickname) {
  const $nicknameWrapper = document.createElement("div");
  $nicknameWrapper.classList.add("nicknameWrapper");

  const $nickNameInputWrapper = document.createElement("div");
  $nickNameInputWrapper.classList.add("nickNameInputWrapper");

  const $nicknameText = document.createElement("div");
  $nicknameText.classList.add("nicknameText");
  $nicknameText.innerHTML = "닉네임";

  const $nicknameContentWrapper = document.createElement("div");
  $nicknameContentWrapper.classList.add("nicknameContentWrapper");

  const $nicknameInput = document.createElement("input");
  $nicknameInput.classList.add("nicknameInput");
  nickname ? $nicknameInput.setAttribute("value", nickname) : "";
  $nicknameInput.setAttribute("type", "text");
  $nicknameInput.setAttribute("placeholder", "닉네임을 입력해주세요.");

  $nicknameContentWrapper.appendChild($nicknameInput);
  $nickNameInputWrapper.appendChild($nicknameText);
  $nickNameInputWrapper.appendChild($nicknameContentWrapper);

  $nicknameWrapper.appendChild($nickNameInputWrapper);

  //todo: 닉네임 체크 기능 구현
  const $nicknameCheck = document.createElement("div");
  $nicknameCheck.classList.add("nicknameCheck");
  // $nicknameCheck.innerHTML = "사용 중인 닉네임 입니다 등,, 에러 문구";
  $nicknameCheck.style.display = "none"; //에러 문구가 없을 때는 display: none
  $nicknameWrapper.appendChild($nicknameCheck);

  return $nicknameWrapper;
}
