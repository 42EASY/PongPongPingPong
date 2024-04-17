import changeUrl from "../Router.js";

export default function NotFound() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $page = document.createElement("div");
  $page.classList.add("notFound");

  const $errHeader = document.createElement("div");
  $page.appendChild($errHeader);
  $errHeader.classList.add("errHeader");

  const $errImage = document.createElement("img");
  $errImage.classList.add("errImage");
  $errImage.setAttribute("src", "./src/images/sponge.png");
  $errImage.setAttribute("alt", "sponge_image");
  $page.appendChild($errImage);

  $errHeader.append("404 PAGE NOT FOUND");

  const $errBody = document.createElement("div");
  $page.appendChild($errBody);
  $errBody.classList.add("errBody");
  const $errBodyText1 = document.createElement("div");
  const $errBodyText2 = document.createElement("div");
  $errBodyText1.innerHTML = "요청하신 페이지를 찾을 수 없습니다.";
  $errBody.appendChild($errBodyText1);
  $errBodyText2.innerHTML = "입력하신 주소가 정확한지 다시 한 번 확인해주세요.";
  $errBody.appendChild($errBodyText2);
  $app.appendChild($page);
  const $homeButton = document.createElement("button");
  const $homeButtonIcon = document.createElement("i");
  const $homeButtonText = document.createElement("div");
  $homeButtonIcon.classList.add("bi", "bi-box-arrow-left");
  $homeButton.appendChild($homeButtonIcon);
  $homeButton.appendChild($homeButtonText);
  $homeButtonText.append("Go To Login");
  $homeButton.classList.add("btn", "homeButton");

  $homeButton.addEventListener("click", () => {
    changeUrl("/");
  });

  $page.appendChild($homeButton);
}
