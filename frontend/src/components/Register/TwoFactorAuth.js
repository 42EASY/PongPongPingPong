export default function TwoFactorAuth() {
  const $TwoFactorAuthWrapper = document.createElement("div");
  $TwoFactorAuthWrapper.classList.add("twoFactorAuthWrapper");

  const $TwoFactorAuthText = document.createElement("div");
  $TwoFactorAuthText.classList.add("twoFactorAuthText");
  $TwoFactorAuthText.innerHTML = "2차 인증";

  const $TwoFactorAuthContentWrapper = document.createElement("div");
  $TwoFactorAuthContentWrapper.classList.add("twoFactorAuthContentWrapper");

  const $TwoFactorAuthContent = document.createElement("div");
  $TwoFactorAuthContent.classList.add("twoFactorAuthContent");

  const $TwoFactorAuthContentInfo = document.createElement("div");
  $TwoFactorAuthContentInfo.classList.add("twoFactorAuthContentInfo");
  $TwoFactorAuthContentInfo.innerHTML = "Google Authentication";

  $TwoFactorAuthContent.appendChild($TwoFactorAuthContentInfo);

  const $TwoFactorAuthContentSelectBlock = document.createElement("div");
  $TwoFactorAuthContentSelectBlock.classList.add(
    "twoFactorAuthContentSelectBlock"
  );

  //todo: 비활성화/활성화 클릭 이벤트 추가
  const $TwoFactorAuthDeactive = document.createElement("div");
  $TwoFactorAuthDeactive.classList.add("twoFactorAuthUnSelect");
  //선택 취소 시 twoFactorAuthSelect 클래스 삭제 및 twoFactorAuthUnSelect 클래스 추가
  $TwoFactorAuthDeactive.classList.add("twoFactorAuthDeactive");
  $TwoFactorAuthDeactive.innerHTML = "비활성화";

  const $TwoFactorAuthActive = document.createElement("div");
  //선택 시 twoFactorAuthUnSelect 클래스 삭제 및 twoFactorAuthSelect 클래스 추가
  $TwoFactorAuthActive.classList.add("twoFactorAuthSelect");
  $TwoFactorAuthActive.classList.add("twoFactorAuthActive");
  $TwoFactorAuthActive.innerHTML = "활성화";

  $TwoFactorAuthContentSelectBlock.appendChild($TwoFactorAuthDeactive);
  $TwoFactorAuthContentSelectBlock.appendChild($TwoFactorAuthActive);

  $TwoFactorAuthContent.appendChild($TwoFactorAuthContentSelectBlock);

  $TwoFactorAuthContentWrapper.appendChild($TwoFactorAuthContent);

  $TwoFactorAuthWrapper.appendChild($TwoFactorAuthText);
  $TwoFactorAuthWrapper.appendChild($TwoFactorAuthContentWrapper);

  return $TwoFactorAuthWrapper;
}
