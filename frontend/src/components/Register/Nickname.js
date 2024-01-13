export default function Nickname() {
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
  $nicknameInput.setAttribute("type", "text");
  $nicknameInput.setAttribute("placeholder", "닉네임을 입력해주세요.");

  $nicknameContentWrapper.appendChild($nicknameInput);
  $nickNameInputWrapper.appendChild($nicknameText);
  $nickNameInputWrapper.appendChild($nicknameContentWrapper);

  $nicknameWrapper.appendChild($nickNameInputWrapper);

  //todo: 닉네임 체크 기능 구현
  const $nicknameCheck = document.createElement("div");
  $nicknameCheck.classList.add("nicknameCheck");
  $nicknameCheck.innerHTML = "사용 중인 닉네임 입니다 등,, 에러 문구";
  $nicknameWrapper.appendChild($nicknameCheck);

  return $nicknameWrapper;
}
