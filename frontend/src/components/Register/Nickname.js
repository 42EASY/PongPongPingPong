export default function Nickname() {
  const $Nickname = document.createElement("div");
  $Nickname.classList.add("nickname");

  const $NickNameInputArea = document.createElement("div");
  $NickNameInputArea.classList.add("nicknameInputArea");

  const $NicknameText = document.createElement("div");
  $NicknameText.classList.add("nicknameText");
  $NicknameText.innerHTML = "닉네임";

  const $NicknameInput = document.createElement("div");
  $NicknameInput.classList.add("nicknamePlace");

  const $NicknameBlock = document.createElement("input");
  $NicknameBlock.classList.add("nicknameBlock");
  $NicknameBlock.setAttribute("type", "text");
  $NicknameBlock.setAttribute("placeholder", "닉네임을 입력해주세요.");

  $NicknameInput.appendChild($NicknameBlock);
  $NickNameInputArea.appendChild($NicknameText);
  $NickNameInputArea.appendChild($NicknameInput);

  $Nickname.appendChild($NickNameInputArea);

  //todo: 닉네임 체크 기능 구현
  const $NicknameCheck = document.createElement("div");
  $NicknameCheck.classList.add("nicknameCheck");
  $NicknameCheck.innerHTML = "사용 중인 닉네임 입니다 등,, 에러 문구";
  $Nickname.appendChild($NicknameCheck);

  return $Nickname;
}
