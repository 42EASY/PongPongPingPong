import { getIs2fa } from "../../state/State.js";
import Modal from "../Modal/Modal.js";

export default function TwoFactorAuth(is2fa) {
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
  $twoFactorAuthContentInfo.innerHTML = "Google OTP";

  $twoFactorAuthContent.appendChild($twoFactorAuthContentInfo);

  const $twoFactorAuthContentSelectBlock = document.createElement("div");
  $twoFactorAuthContentSelectBlock.classList.add(
    "twoFactorAuthContentSelectBlock"
  );

  const $twoFactorAuthDeactive = document.createElement("div");
  $twoFactorAuthDeactive.classList.add("twoFactorAuthDeactive");

  $twoFactorAuthDeactive.innerHTML = "비활성화";

  const $twoFactorAuthActive = document.createElement("div");
  $twoFactorAuthActive.classList.add("twoFactorAuthActive");
  $twoFactorAuthActive.innerHTML = "활성화";

  if (is2fa) {
    $twoFactorAuthActive.classList.add("twoFactorAuthSelect");
    $twoFactorAuthDeactive.classList.remove("twoFactorAuthSelect");
  } else {
    $twoFactorAuthActive.classList.remove("twoFactorAuthSelect");
    $twoFactorAuthDeactive.classList.add("twoFactorAuthSelect");
  }

  $twoFactorAuthContentSelectBlock.appendChild($twoFactorAuthDeactive);
  $twoFactorAuthContentSelectBlock.appendChild($twoFactorAuthActive);

  $twoFactorAuthContent.appendChild($twoFactorAuthContentSelectBlock);

  $twoFactorAuthContentWrapper.appendChild($twoFactorAuthContent);

  $twoFactorAuthWrapper.appendChild($twoFactorAuthText);
  $twoFactorAuthWrapper.appendChild($twoFactorAuthContentWrapper);

  //비활성화 클릭 이벤트
  //todo: is2fa가 true인 경우, 비활성화 클릭 시 인증 모달 띄우기
  $twoFactorAuthDeactive.addEventListener("click", () => {
    $twoFactorAuthActive.classList.remove("twoFactorAuthSelect");
    $twoFactorAuthDeactive.classList.add("twoFactorAuthSelect");
    if (is2fa == false) return;
    Modal("otp");
    //모달 결과에 따라 is2fa 변경
  });

  //활성화 클릭 이벤트
  //todo: 활성화 클릭 시, 인증 모달 띄우기
  $twoFactorAuthActive.addEventListener("click", () => {
    $twoFactorAuthActive.classList.add("twoFactorAuthSelect");
    $twoFactorAuthDeactive.classList.remove("twoFactorAuthSelect");
    Modal("tfa");
    //모달 결과에 따라 is2fa 변경
  });

  return $twoFactorAuthWrapper;
}
