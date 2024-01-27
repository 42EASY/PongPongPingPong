export default function LoginButton() {
  const $loginButton = document.createElement("div");
  $loginButton.classList.add("loginButton");

  const $image = document.createElement("img");
  $image.setAttribute("src", "./src/images/42_logo.png");
  $image.setAttribute("alt", "42_logo");
  $image.classList.add("image42");

  const $loginText = document.createElement("div");
  $loginText.classList.add("loginText");
  $loginText.innerHTML = "계정으로 로그인";

  $loginButton.appendChild($image);
  $loginButton.appendChild($loginText);

  return $loginButton;
}
