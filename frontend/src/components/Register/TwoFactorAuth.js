export default function TwoFactorAuth() {
  const $TwoFactorAuth = document.createElement("div");
  $TwoFactorAuth.classList.add("twoFactorAuth");

  const $TwoFactorAuthText = document.createElement("div");
  $TwoFactorAuthText.classList.add("twoFactorAuthText");
  $TwoFactorAuthText.innerHTML = "2차 인증";

  const $TwoFactorAuthPlace = document.createElement("div");
  $TwoFactorAuthPlace.classList.add("twoFactorAuthPlace");

  const $TwoFactorAuthBlock = document.createElement("div");
  $TwoFactorAuthBlock.classList.add("twoFactorAuthBlock");

  const $TwoFactorAuthNotice = document.createElement("div");
  $TwoFactorAuthNotice.classList.add("twoFactorAuthNotice");
  $TwoFactorAuthNotice.innerHTML = "Google Authentication";

  $TwoFactorAuthBlock.appendChild($TwoFactorAuthNotice);

  const $TwoFactorAuthSelectBlock = document.createElement("div");
  $TwoFactorAuthSelectBlock.classList.add("twoFactorAuthSelectBlock");

  //todo: 비활성화/활성화 클릭 이벤트 추가
  const $TwoFactorAuthUnSelect = document.createElement("div");
  $TwoFactorAuthUnSelect.classList.add("twoFactorAuthUnSelect");
  //선택 취소 시 twoFactorAuthSelect 클래스 삭제 및 twoFactorAuthUnSelect 클래스 추가
  $TwoFactorAuthUnSelect.classList.add("twoFactorAuthDeactive");
  $TwoFactorAuthUnSelect.innerHTML = "비활성화";

  const $TwoFactorAuthSelect = document.createElement("div");
  //선택 시 twoFactorAuthUnSelect 클래스 삭제 및 twoFactorAuthSelect 클래스 추가
  $TwoFactorAuthSelect.classList.add("twoFactorAuthSelect");
  $TwoFactorAuthSelect.classList.add("twoFactorAuthActive");
  $TwoFactorAuthSelect.innerHTML = "활성화";

  $TwoFactorAuthSelectBlock.appendChild($TwoFactorAuthUnSelect);
  $TwoFactorAuthSelectBlock.appendChild($TwoFactorAuthSelect);

  $TwoFactorAuthBlock.appendChild($TwoFactorAuthSelectBlock);

  $TwoFactorAuthPlace.appendChild($TwoFactorAuthBlock);

  $TwoFactorAuth.appendChild($TwoFactorAuthText);
  $TwoFactorAuth.appendChild($TwoFactorAuthPlace);

  return $TwoFactorAuth;
}
