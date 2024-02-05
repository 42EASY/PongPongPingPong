import Nav from "../pages/Nav.js";
import Title from "../components/Register/Title.js";
import UproadImage from "../components/Register/UproadImage.js";
import Email from "../components/Register/Email.js";
import Nickname from "../components/Register/Nickname.js";
import TwoFactorAuth from "../components/Register/TwoFactorAuth.js";
import SubmitButton from "../components/Register/SubmitButton.js";
import { getIsLogin, getEmail, getIs2fa } from "../state/State.js";
import changeUrl from "../Router.js";

export default function Register(
  isInit = false,
  image = "./src/images/none_profile.png",
  nickname = ""
) {
  if (getIsLogin() === false) {
    changeUrl("/"); //로그인 안되어있으면 로그인 페이지로 이동
    return;
  }
  isInit === false ? Nav() : "";

  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  //전체 영역
  const $registerWrapper = document.createElement("div");
  $registerWrapper.classList.add("registerWrapper");

  //타이틀
  const $title =
    isInit === true ? Title("퐁퐁핑퐁 가입하기") : Title("프로필 편집");
  $registerWrapper.appendChild($title);

  //이미지 업로드
  const $uproadImage = UproadImage(image);
  $registerWrapper.appendChild($uproadImage);

  //이메일
  const $email = Email(getEmail());
  $registerWrapper.appendChild($email);

  //닉네임
  const $nickname = Nickname(nickname);
  $registerWrapper.appendChild($nickname);

  //2차인증
  const $twoFactorAuth = TwoFactorAuth(getIs2fa());
  $registerWrapper.appendChild($twoFactorAuth);

  //계정만들기 버튼
  const $submitButton =
    isInit === true ? SubmitButton("계정 만들기") : SubmitButton("수정하기");
  $registerWrapper.appendChild($submitButton);

  $app.appendChild($registerWrapper);
}
