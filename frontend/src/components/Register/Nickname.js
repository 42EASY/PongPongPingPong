export default function Nickname() {
  const $NicknameWrapper = document.createElement("div");
  $NicknameWrapper.classList.add("nicknameWrapper");

  const $NickNameInputWrapper = document.createElement("div");
  $NickNameInputWrapper.classList.add("nickNameInputWrapper");

  const $NicknameText = document.createElement("div");
  $NicknameText.classList.add("nicknameText");
  $NicknameText.innerHTML = "닉네임";

  const $NicknameContentWrapper = document.createElement("div");
  $NicknameContentWrapper.classList.add("nicknameContentWrapper");

  const $NicknameInput = document.createElement("input");
  $NicknameInput.classList.add("nicknameInput");
  $NicknameInput.setAttribute("type", "text");
  $NicknameInput.setAttribute("placeholder", "닉네임을 입력해주세요.");

  $NicknameContentWrapper.appendChild($NicknameInput);
  $NickNameInputWrapper.appendChild($NicknameText);
  $NickNameInputWrapper.appendChild($NicknameContentWrapper);

  $NicknameWrapper.appendChild($NickNameInputWrapper);

  //todo: 닉네임 체크 기능 구현
  const $NicknameCheck = document.createElement("div");
  $NicknameCheck.classList.add("nicknameCheck");
  $NicknameCheck.innerHTML = "사용 중인 닉네임 입니다 등,, 에러 문구";
  $NicknameWrapper.appendChild($NicknameCheck);

  return $NicknameWrapper;
}
