import Title from "../components/Register/Title.js";

export default function Register() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  //타이틀
  const $title = Title("퐁퐁핑퐁 가입하기");
  $app.appendChild($title);
}
