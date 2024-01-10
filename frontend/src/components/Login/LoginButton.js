export default function LoginButton() {
  const $loginButton = document.createElement("button");
  $loginButton.classList.add("loginButton");
  $loginButton.innerHTML = "42 계정으로 로그인";

  return $loginButton;
}
