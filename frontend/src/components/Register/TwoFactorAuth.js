import {
  setNewAccessToken,
  getAccessToken,
  setIs2fa,
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

  if (is2fa === "true") {
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
  $twoFactorAuthDeactive.addEventListener("click", () => {
    if ($twoFactorAuthDeactive.classList.contains("twoFactorAuthSelect"))
      return;
    $twoFactorAuthActive.classList.remove("twoFactorAuthSelect");
    $twoFactorAuthDeactive.classList.add("twoFactorAuthSelect");

    if (is2fa === "true") {
      call2faOtpModal().then((result) => {
        if (result === true) {
          setIs2fa(false);
        } else {
          $twoFactorAuthActive.classList.add("twoFactorAuthSelect");
          $twoFactorAuthDeactive.classList.remove("twoFactorAuthSelect");
        }
      });
    }
  });

  //활성화 클릭 이벤트
  $twoFactorAuthActive.addEventListener("click", () => {
    $twoFactorAuthActive.classList.add("twoFactorAuthSelect");
    $twoFactorAuthDeactive.classList.remove("twoFactorAuthSelect");

    call2faQrApi().then((result) => {
      if (result === true) {
        call2faOtpModal().then((result) => {
          if (result === true) {
            setIs2fa(true);
          } else {
            if (getIs2fa() === false) {
              $twoFactorAuthActive.classList.remove("twoFactorAuthSelect");
              $twoFactorAuthDeactive.classList.add("twoFactorAuthSelect");
            }
          }
        });
      } else {
        if (getIs2fa() === false) {
          $twoFactorAuthActive.classList.remove("twoFactorAuthSelect");
          $twoFactorAuthDeactive.classList.add("twoFactorAuthSelect");
        }
      }
    });
  });

  return $twoFactorAuthWrapper;
}

//2차 인증 QR코드 API 호출
function call2faQrApi() {
  return new Promise((resolve) => {
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
        if (data.code === 200) {
          Modal(
            "tfa",
            `data:image/png;base64,${data.result.encoded_image}`
          ).then((result) => {
            if (result.isPositive === true) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else if (data.code === 401) {
          setNewAccessToken().then((result) => {
            if (result === true) resolve(call2faQrApi());
          });
        }
      });
  });
}

//2차 인증 OTP 모달 호출
export function call2faOtpModal() {
  return new Promise((resolve) => {
    Modal("otp").then(async (result) => {
      if (result.isPositive === true) {
        call2faOtqApi(result.input).then((status) => {
          if (status === true) {
            console.log("2차 인증 성공");
            resolve(true);
          } else if (status === false) {
            console.log("2차 인증 실패");
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  });
}

//2차 인증 OTP API 호출
function call2faOtqApi(otpNum) {
  return new Promise((resolve) => {
    const url = "http://localhost:8000/api/v1/auth/2fa/";

    fetch(url, {
      method: "POST",
      headers: {
        "content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({
        otp_code: otpNum,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          Modal("tfaSuccess").then((result) => {
            resolve(true);
          });
        } else if (data.code === 401 && data.message === "2차 인증 실패") {
          Modal("tfaFail").then((result) => {
            resolve(false);
          });
        } else if (data.code === 401) {
          setNewAccessToken().then((result) => {
            if (result === true) resolve(call2faOtqApi());
          });
        } else {
          Modal("tfaFail").then((result) => {
            resolve(false);
          });
        }
      });
  });
}
