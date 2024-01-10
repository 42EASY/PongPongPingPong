export default function Title() {
  const $title = document.createElement("div");
  const $titleText1 = document.createElement("h1");
  const $titleText2 = document.createElement("h1");
  const $titleText3 = document.createElement("h1");
  const $titleText4 = document.createElement("h1");

  $titleText1.innerHTML = "PONG";
  $titleText2.innerHTML = "PONG";
  $titleText3.innerHTML = "PING";
  $titleText4.innerHTML = "PONG";

  $title.appendChild($titleText1);
  $title.appendChild($titleText2);
  $title.appendChild($titleText3);
  $title.appendChild($titleText4);

  return $title;
}
