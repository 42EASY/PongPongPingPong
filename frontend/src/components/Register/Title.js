export default function Title(contents) {
  const $Title = document.createElement("div");
  $Title.classList.add("title");
  $Title.innerHTML = contents;

  return $Title;
}
