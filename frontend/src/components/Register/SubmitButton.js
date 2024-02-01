import { getToken } from "../../state/State.js";

export default function SubmitButton(text) {
  const $submitButton = document.createElement("div");
  $submitButton.classList.add("submitButton");
  $submitButton.innerHTML = text;

  // //todo: 계정 만들기 버튼 클릭 시 회원가입 기능 구현
  // $submitButton.addEventListener("click", () => {
  //   fetch(url, {
  //     method: "PATCH",
  //     headers: {
  //       "content-Type": "multipart/form-data",
  //       Authorization: `Bearer ${getToken()}`,
  //     },
  //     body: JSON.stringify({
  //       image: "이미지 파일",
  //       data: {
  //         nickname: "babo",
  //         "2fa": false,
  //       },
  //     }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log(data);
  //       if (data.code === 200) {
  //         setLoginState(true, data.data.token);
  //         changeUrl("/register");
  //       } else if (data.code === 400) {
  //         // 닉네임 중복 등 응답 처리 필요
  //       }
  //     });
  // });

  return $submitButton;
}
