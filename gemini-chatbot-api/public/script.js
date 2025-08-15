const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// History of messages to maintain conversation context for the API
const messages = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message to UI and history
  appendMessage('user', userMessage);
  messages.push({ role: 'user', content: userMessage });
  input.value = '';

  // Show a thinking message and get a reference to it
  const thinkingMessageElement = appendMessage('bot', 'Gemini is thinking...');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: messages }),
    });

    if (!res.ok) {
      let errorText = `Server error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.error) {
          errorText = errorData.error;
        }
      } catch (e) {
        // Response was not json, stick with the status text
      }
      throw new Error(errorText);
    }

    const data = await res.json();

    if (data && data.result) {
      // Update the thinking message with the actual response
      thinkingMessageElement.textContent = data.result;
      // Add bot response to history for context in the next turn
      messages.push({ role: 'model', content: data.result });
    } else {
      thinkingMessageElement.textContent = 'Sorry, no response received.';
      // Do not add empty/failed responses to history
    }
  } catch (error) {
    console.error('Error:', error);
    thinkingMessageElement.textContent = 'Failed to get response from server.';
  } finally {
    // Ensure the chatbox is scrolled to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the element so it can be modified
}
