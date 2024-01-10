export default function Nickname() {
  const $Nickname = document.createElement("div");
  $Nickname.classList.add("nickname");

  const $NicknameText = document.createElement("div");
  $NicknameText.classList.add("nicknameText");
  $NicknameText.innerHTML = "닉네임";

  const $NicknameInput = document.createElement("input");
  $NicknameInput.classList.add("nicknamePlace");
  $NicknameInput.setAttribute("type", "text");
  $NicknameInput.setAttribute("placeholder", "닉네임을 입력해주세요.");

  const $NicknameCheck = document.createElement("div");
  $NicknameCheck.classList.add("nicknameCheck");
  $NicknameCheck.innerHTML = "사용 중인 닉네임 입니다 등,, 에러 문구";

  $Nickname.appendChild($NicknameText);
  $Nickname.appendChild($NicknameInput);
  $Nickname.appendChild($NicknameCheck);

  return $Nickname;
}
