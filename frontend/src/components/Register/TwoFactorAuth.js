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
  $TwoFactorAuthContentInfo.innerHTML = "Googl e Authentication";

  $TwoFactorAuthContent.appendChild($TwoFactorAuthContentInfo);

  const $TwoFactorAuthContentSelectBlock = document.createElement("div");
  $TwoFactorAuthContentSelectBlock.classList.add(
    "twoFactorAuthContentSelectBlock"
  );

  const $TwoFactorAuthDeactive = document.createElement("div");
  //초기 화면에서는 비활성화 선택
  $TwoFactorAuthDeactive.classList.add("twoFactorAuthSelect");
  $TwoFactorAuthDeactive.classList.add("twoFactorAuthDeactive");
  $TwoFactorAuthDeactive.innerHTML = "비활성화";

  const $TwoFactorAuthActive = document.createElement("div");
  $TwoFactorAuthActive.classList.add("twoFactorAuthUnSelect");
  $TwoFactorAuthActive.classList.add("twoFactorAuthActive");
  $TwoFactorAuthActive.innerHTML = "활성화";

  $TwoFactorAuthContentSelectBlock.appendChild($TwoFactorAuthDeactive);
  $TwoFactorAuthContentSelectBlock.appendChild($TwoFactorAuthActive);

  $TwoFactorAuthContent.appendChild($TwoFactorAuthContentSelectBlock);

  $TwoFactorAuthContentWrapper.appendChild($TwoFactorAuthContent);

  $TwoFactorAuthWrapper.appendChild($TwoFactorAuthText);
  $TwoFactorAuthWrapper.appendChild($TwoFactorAuthContentWrapper);

  //비활성화 클릭 이벤트
  $TwoFactorAuthDeactive.onclick = () => {
    $TwoFactorAuthDeactive.classList.remove("twoFactorAuthUnSelect");
    $TwoFactorAuthDeactive.classList.add("twoFactorAuthSelect");
    $TwoFactorAuthActive.classList.remove("twoFactorAuthSelect");
    $TwoFactorAuthActive.classList.add("twoFactorAuthUnSelect");
  };

  //활성화 클릭 이벤트
  //todo: 활성화 클릭 시, 확인 모달 띄우기
  $TwoFactorAuthActive.onclick = () => {
    $TwoFactorAuthActive.classList.remove("twoFactorAuthUnSelect");
    $TwoFactorAuthActive.classList.add("twoFactorAuthSelect");
    $TwoFactorAuthDeactive.classList.remove("twoFactorAuthSelect");
    $TwoFactorAuthDeactive.classList.add("twoFactorAuthUnSelect");
  };

  return $TwoFactorAuthWrapper;
}
