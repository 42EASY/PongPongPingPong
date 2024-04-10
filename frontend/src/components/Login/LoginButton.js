export default async function LoginButton() {
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

  const login42Url =
    "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-03c203eb7e0b2f87148d7780ba460a78185012907e9d8819bae6dfd634e707ee&redirect_uri=http%3A%2F%2Flocalhost%2Flogin%2Foauth2%2Fcode&response_type=code";
  $loginButton.addEventListener("click", () => {
    window.location.replace(login42Url);
  });

  return $loginButton;
}
