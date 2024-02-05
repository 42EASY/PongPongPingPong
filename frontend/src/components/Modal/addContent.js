export default function addContentElement(content) {
  let $contentElement;

  switch (content.type) {
    case "text":
      $contentElement = document.createElement("div");
      $contentElement.innerHTML = content.text;
      break;
    case "image":
      $contentElement = document.createElement("img");
      $contentElement.setAttribute("src", content.src);
      $contentElement.setAttribute("alt", content.alt);
      break;
    case "input":
      $contentElement = document.createElement("input");
      $contentElement.type = "text";
      $contentElement.placeholder = content.placeHolder;
      break;
    case "radio":
      $contentElement = document.createElement("div");
      $contentElement.classList.add("radioBox");

      const $radioButton = document.createElement("input");
      $radioButton.type = "radio";
      $radioButton.name = "game";
      $radioButton.value = content.text;
      $contentElement.appendChild($radioButton);

      const $label = document.createElement("label");
      $label.textContent = content.text;
      $contentElement.appendChild($label);

      if (content.explanation) {
        const $explanation = document.createElement("div");
        $explanation.classList.add("explanation");
        $explanation.innerHTML = content.explanation;
        $label.appendChild($explanation);
      }
      break;
    case "primaryButton":
    case "secondaryButton":
    case "singleButton":
      $contentElement = document.createElement("button");
      $contentElement.innerHTML = content.text;
      break;
    default:
      $contentElement = content;
  }
  if (content.class) $contentElement.className = content.class;
  if (content.id) $contentElement.id = content.id;
  return $contentElement;
}
