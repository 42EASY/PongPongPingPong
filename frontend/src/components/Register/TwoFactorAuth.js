import {
  setNewAccessToken,
  getAccessToken,
  getIs2fa,
} from "../../state/State.js";
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

  //2차 인증 QR코드 API 호출
  function call2faQrApi() {
    const url = "http://localhost:8000/api/v1/auth/2fa/";

    fetch(url, {
      method: "GET",
      headers: {
        "content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.code === 200) {
          Modal("tfa");
          const $modalBodyQr = document.querySelector(".modalBody img");
          $modalBodyQr.setAttribute(
            "src",
            `data:image/png;base64,${data.result.encoded_image}`
          );
        } else if (data.code === 401) {
          setNewAccessToken();
          call2faQrApi();
        }
      });
  }

  //2차 인증 OTP API 호출
  function call2faOtqApi() {
    //모달 리턴값으로 otp 코드 받기
    const url = "http://localhost:8000/api/v1/auth/2fa/";

    fetch(url, {
      method: "POST",
      headers: {
        "content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({
        otp: "test",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.code === 200) {
          //인증 성공 모달 띄우기
        } else if (data.code === 401) {
          setNewAccessToken();
          call2faOtqApi();
        } else {
          //인증 실패 모달 띄우기
        }
      });
  }

  //비활성화 클릭 이벤트
  $twoFactorAuthDeactive.addEventListener("click", () => {
    $twoFactorAuthActive.classList.remove("twoFactorAuthSelect");
    $twoFactorAuthDeactive.classList.add("twoFactorAuthSelect");
    if (is2fa == false) return;
    //is2fa가 true인 경우, otp 인증
    Modal("otp");
    //todo: 모달 결과에 따라 select 변경
  });

  //활성화 클릭 이벤트
  $twoFactorAuthActive.addEventListener("click", () => {
    $twoFactorAuthActive.classList.add("twoFactorAuthSelect");
    $twoFactorAuthDeactive.classList.remove("twoFactorAuthSelect");

    call2faQrApi();
    Modal("otp");
    const $modalOtpSummit = document.querySelector(".otpSummit");
    $modalOtpSummit.addEventListener("click", call2faOtqApi);
    //todo: 모달 결과에 따라 select 변경
  });

  return $twoFactorAuthWrapper;
}
