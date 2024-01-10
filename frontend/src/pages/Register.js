import Title from "../components/Register/Title.js";
import UproadImage from "../components/Register/UproadImage.js";

export default function Register() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  //타이틀
  const $title = Title("퐁퐁핑퐁 가입하기");
  $app.appendChild($title);

  //이미지 업로드
  const $uproadImage = UproadImage();
  $app.appendChild($uproadImage);
}
