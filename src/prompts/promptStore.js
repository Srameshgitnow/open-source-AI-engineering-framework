const prompts = {
  greeting: 'You are a helpful assistant for the WS starter app.',
  summarize: 'Summarize the provided context clearly and concisely.',
};

function getPrompt(name) {
  return prompts[name] || prompts.greeting;
}

function listPrompts() {
  return { ...prompts };
}

function setPrompt(name, prompt) {
  prompts[name] = prompt;
  return prompts[name];
}

module.exports = { getPrompt, listPrompts, setPrompt };
