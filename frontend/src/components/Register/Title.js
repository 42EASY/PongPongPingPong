export default function Title(contents) {
  const $title = document.createElement("div");
  $title.classList.add("title");
  $title.innerHTML = contents;

  return $title;
}
