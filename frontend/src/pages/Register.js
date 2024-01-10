import Title from "../components/Register/Title.js";
import UproadImage from "../components/Register/UproadImage.js";
import Email from "../components/Register/Email.js";
import Nickname from "../components/Register/Nickname.js";
import SubmitButton from "../components/Register/SubmitButton.js";

export default function Register() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  //타이틀
  const $title = Title("퐁퐁핑퐁 가입하기");
  $app.appendChild($title);

  //이미지 업로드
  const $uproadImage = UproadImage();
  $app.appendChild($uproadImage);

  //이메일
  const $email = Email();
  $app.appendChild($email);

  //닉네임
  const $nickname = Nickname();
  $app.appendChild($nickname);

  //계정만들기 버튼
  const $submitButton = SubmitButton();
  $app.appendChild($submitButton);
}
