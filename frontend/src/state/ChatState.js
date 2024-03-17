let chatContents = [{ id: 0, list: [] }];

const loadChatContent = () => {
  const storedChatContents = localStorage.getItem("chatContents");
  if (storedChatContents) chatContents = JSON.parse(storedChatContents);
};

const saveChatContent = () => {
  localStorage.setItem("chatContents", JSON.stringify(chatContents));
};

loadChatContent();

export const addChatContent = (id, data) => {
  const idx = chatContents.findIndex((e) => e.id === id);

  if (idx !== -1) chatContents[idx].list.push(data);
  else chatContents.push({ id: id, list: [data] });

  saveChatContent();
};

export const delChatContent = (id) => {
  const idx = chatContents.findIndex((e) => e.id === id);

  if (idx !== -1) {
    chatContents.splice(idx, 1);
    saveChatContent();
  }
};

export const getChatContent = (id) => {
  const elem = chatContents.find((e) => e.id === id);

  if (elem) return elem.list;
  return null;
};
