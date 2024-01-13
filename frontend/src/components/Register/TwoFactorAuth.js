export default function TwoFactorAuth() {
  const $twoFactorAuthWrapper = document.createElement("div");
  $twoFactorAuthWrapper.classList.add("twoFactorAuthWrapper");

  const $twoFactorAuthText = document.createElement("div");
  $twoFactorAuthText.classList.add("twoFactorAuthText");
  $twoFactorAuthText.innerHTML = "2차 인증";

  const $twoFactorAuthContentWrapper = document.createElement("div");
  $twoFactorAuthContentWrapper.classList.add("twoFactorAuthContentWrapper");

  const $twoFactorAuthContent = document.createElement("div");
  $twoFactorAuthContent.classList.add("twoFactorAuthContent");

  const $twoFactorAuthContentInfo = document.createElement("div");
  $twoFactorAuthContentInfo.classList.add("twoFactorAuthContentInfo");
  $twoFactorAuthContentInfo.innerHTML = "Googl e Authentication";

  $twoFactorAuthContent.appendChild($twoFactorAuthContentInfo);

  const $twoFactorAuthContentSelectBlock = document.createElement("div");
  $twoFactorAuthContentSelectBlock.classList.add(
    "twoFactorAuthContentSelectBlock"
  );

  const $twoFactorAuthDeactive = document.createElement("div");
  //초기 화면에서는 비활성화 선택
  $twoFactorAuthDeactive.classList.add("twoFactorAuthSelect");
  $twoFactorAuthDeactive.classList.add("twoFactorAuthDeactive");
  $twoFactorAuthDeactive.innerHTML = "비활성화";

  const $twoFactorAuthActive = document.createElement("div");
  $twoFactorAuthActive.classList.add("twoFactorAuthUnSelect");
  $twoFactorAuthActive.classList.add("twoFactorAuthActive");
  $twoFactorAuthActive.innerHTML = "활성화";

  $twoFactorAuthContentSelectBlock.appendChild($twoFactorAuthDeactive);
  $twoFactorAuthContentSelectBlock.appendChild($twoFactorAuthActive);

  $twoFactorAuthContent.appendChild($twoFactorAuthContentSelectBlock);

  $twoFactorAuthContentWrapper.appendChild($twoFactorAuthContent);

  $twoFactorAuthWrapper.appendChild($twoFactorAuthText);
  $twoFactorAuthWrapper.appendChild($twoFactorAuthContentWrapper);

  //비활성화 클릭 이벤트
  $twoFactorAuthDeactive.onclick = () => {
    $twoFactorAuthDeactive.classList.remove("twoFactorAuthUnSelect");
    $twoFactorAuthDeactive.classList.add("twoFactorAuthSelect");
    $twoFactorAuthActive.classList.remove("twoFactorAuthSelect");
    $twoFactorAuthActive.classList.add("twoFactorAuthUnSelect");
  };

  //활성화 클릭 이벤트
  //todo: 활성화 클릭 시, 확인 모달 띄우기
  $twoFactorAuthActive.onclick = () => {
    $twoFactorAuthActive.classList.remove("twoFactorAuthUnSelect");
    $twoFactorAuthActive.classList.add("twoFactorAuthSelect");
    $twoFactorAuthDeactive.classList.remove("twoFactorAuthSelect");
    $twoFactorAuthDeactive.classList.add("twoFactorAuthUnSelect");
  };

  return $twoFactorAuthWrapper;
}
