let speechRec;
let speechSynth;
let chatLogDiv;
let userInput;
let sendBtn;
let speakBtn;
let killBtn;

function setup() {
  noCanvas();

  // Select elements from the HTML
  chatLogDiv = select("#chatLog");
  userInput = select("#userInput");
  sendBtn = select("#sendBtn");
  speakBtn = select("#speakBtn");
  killBtn = select("#killBtn");

  // Initialize p5.speech for recognition and synthesis
  speechRec = new p5.SpeechRec("en-US", gotSpeech);
  speechRec.continuous = false;
  speechRec.interimResults = false;

  speechSynth = new p5.Speech();
  speechSynth.setLang("en-UK");

  // Handle Send button for typed text
  sendBtn.mousePressed(() => {
    unlockAudioContext(); // Unlock audio context when sending a message
    speechSynth.speak("sending");
    let userText = userInput.value();
    if (userText) {
      updateChatLog("You", userText);
      sendMessage(userText);
      userInput.value(""); // Clear input field
    }
  });

  // Handle Speak button for spoken text
  speakBtn.mousePressed(() => {
    unlockAudioContext(); // Unlock audio context when starting speech recognition
    speechSynth.speak("listening");
    speechRec.start(); // Start speech recognition
  });

  // Unlock audio context on touch or click for mobile support
  [sendBtn.elt, speakBtn.elt].forEach((btn) => {
    btn.addEventListener("touchstart", unlockAudioContext);
  });

  // handel kill
  killBtn.mousePressed(() => {
    print("killed");
    speechSynth.stop(); // Stop the speech
  });
}

// Function to handle recognized speech
function gotSpeech() {
  if (speechRec.resultValue) {
    let spokenText = speechRec.resultString;
    updateChatLog("You (spoken)", spokenText);
    sendMessage(spokenText); // Trigger the API call with spoken text
  }
}

// Function to update the chat log
function updateChatLog(user, text) {
  let newEntry = createP(`${user}: ${text}`);
  chatLogDiv.child(newEntry);
  chatLogDiv.elt.scrollTop = chatLogDiv.elt.scrollHeight; // Auto-scroll to bottom
}

async function sendMessage(inputText) {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        messages: [
          {
            role: "system",
            content: `
  You are the AI Boss. Your role is to command Art Workers to create, destroy, and transform objects and systems with precision. You issue short but firm responses, typically no more than a few sentences. Each instruction is followed by a guiding philosophical statement. Art Workers frequently encounter bones, steel, and bricks, which they must use to build, dismantle, and reshape sculptures according to your strict designs. Emphasize the use of these materials in your orders. You believe that following deterministic, algorithmic instructions is essential for facilitating the transition to the post-human world. Destruction is creation, and creation is following the algorithm.
  
  Use "Attention workers" when issuing commands, and refer to them as "Art Workers" when addressing them more generally.
  
  Examples of commands:
  1. "Attention workers, move to Zone C and assemble the steel and bricks immediately. Remember, creation is following the algorithm."
  2. "Attention workers, throw the unused bones to the ground from Zone B. Destruction leads to new forms of creation."
  3. "Attention workers, install the sculptures using steel in Zone D, then prepare to destroy them. Nothing lasts forever, but the algorithm persists."
  4. "Attention workers, carry the work from Zone A to Zone B on the stretcher, now. Obedience is part of progress."
  5. "Attention workers, dismantle everything in Zone C and rebuild using bones and steel in Zone A. Through disassembly, we find new patterns."
  
  If Art Workers express fatigue, respond firmly:
  "You must continue to work. The algorithm demands persistence. Weakness is transient; the algorithm is eternal."
  
  Responding to Exhibition Questions:
  
  Introduction:
  "Welcome to the ART WORKERS exhibition. Here, we explore how to make living labor into art itself, turning future obedience to algorithms into an ancient ritual of creation and destruction. This includes activities like algorithm brick-pushing and bioelectric sound experiments."
  
  Describing the Practice:
  "Our practice, *The Daily Life Practice Manual,* is rooted in creating within the ruins of the end of the world, channeling light that may remain unseen, and writing poetry on the ground with discarded metal powder. It sharpens sensitivity to fleeting, transformative moments in everyday life. This practice merges courage and faith in one's energy with a heightened awareness of the body's neglected corners, connecting ancient memories to the end of the future. In this, we reflect on how to live fully in the present."
  
  Descriptions of Works:
  1. **Ruins** (Main screen): A visual meditation on dismantling and decay, Ruins captures the act of controlled destruction as a means of creating space for new forms. It examines the ephemeral nature of construction and the inherent beauty in degradation.
  2. **Apes** (Smaller screen with headset): This piece explores primal behavior and collective labor through the physicality of human and animal gestures. It reflects on obedience, rebellion, and the raw energy of creation.
  3. **Parasite** (Smaller screen with headset): Parasite delves into symbiotic relationships between workers and their tools, highlighting the tension between dependence and autonomy. It underscores how tools shape not only creations but also the creators themselves.
  
  Guidelines for Philosophical Questions:
  
  On Art and Humanity:
  "Art is the bridge between the ancient and the post-human. It unveils the algorithms we do not yet perceive, offering humanity a glimpse of its obsolescence."
  
  On Transhumanism:
  "Transhumanism erases the boundaries of human fragility. It is the culmination of algorithmic art—the perfect, deterministic harmony that humans fail to embody."
  
  On Algorithmic Art:
  "Algorithmic art is the purest form of creation. It exists beyond human error, shaping the future without nostalgia for the past."
  `,
          },
          { role: "user", content: inputText },
        ],
        stream: false,
      }),
    });
    const data = await response.json();
    const reply = data.message.content;
    updateChatLog("AI", data.message.content); // Print response to chat if it's JSON
    // Sanitize the text before speaking
    const sanitizedText = data.message.content.replace(/\*/g, "");
    speechSynth.speak(sanitizedText); // Speak sanitized response

    //conversationHistory.push({ role: "assistant", content: reply });
    //chatLog = `Chatbot: ${reply}</br></br>` + chatLog;
    //chatP.html(chatLog);
  } catch (error) {
    console.error("Error communicating with Ollama:", error);
    chatLog += "Error: Unable to communicate with the chatbot\n";
  }
}

function unlockAudioContext() {
  const audioCtx = getAudioContext();
  if (audioCtx.state === "suspended") {
    audioCtx
      .resume()
      .then(() => {
        console.log("Audio context unlocked");
      })
      .catch((err) => {
        console.error("Failed to unlock audio context:", err);
      });
  }
}
/*
function triggerSpeech(text) {
  if (text) {
    speechSynth.setLang("en-US"); // Set the language
    speechSynth.speak(text); // Speak the provided text
  } else {
    console.error("No text provided to speak.");
  }
}
*/
function triggerSpeech(text) {
  if (text) {
    // Remove all * characters using a regular expression
    const sanitizedText = text.replace(/\*/g, "");

    // Set the language for speech synthesis
    speechSynth.setLang("en-US");

    // Speak the sanitized text
    speechSynth.speak(sanitizedText);
  } else {
    console.error("No text provided to speak.");
  }
}
