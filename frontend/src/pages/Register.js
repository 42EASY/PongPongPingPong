import Title from "../components/Register/Title.js";
import UproadImage from "../components/Register/UproadImage.js";
import Email from "../components/Register/Email.js";
import Nickname from "../components/Register/Nickname.js";
import TwoFactorAuth from "../components/Register/TwoFactorAuth.js";
import SubmitButton from "../components/Register/SubmitButton.js";

export default function Register() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  //전체 영역
  const $registerWrapper = document.createElement("div");
  $registerWrapper.classList.add("registerWrapper");

  //타이틀
  const $title = Title("퐁퐁핑퐁 가입하기"); //or 프로필 편집
  $registerWrapper.appendChild($title);

  //이미지 업로드
  const $uproadImage = UproadImage();
  $registerWrapper.appendChild($uproadImage);

  //이메일
  const $email = Email();
  $registerWrapper.appendChild($email);

  //닉네임
  const $nickname = Nickname(); //어떤 페이지인지 인자로 넘겨주기
  $registerWrapper.appendChild($nickname);

  //2차인증
  const $twoFactorAuth = TwoFactorAuth();
  $registerWrapper.appendChild($twoFactorAuth);

  //계정만들기 버튼
  const $submitButton = SubmitButton("계정 만들기"); //or 수정하기
  $registerWrapper.appendChild($submitButton);

  $app.appendChild($registerWrapper);
}
