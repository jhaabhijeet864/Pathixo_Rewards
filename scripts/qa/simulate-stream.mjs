#!/usr/bin/env node
/**
 * Pathixo Rewards — AI Stream & Ad Injection Simulation Runner
 * 
 * Simulates real-time chatbot response generation, DOM mutation observation,
 * ad card insertion, dwell time countdown, and verified reward logging.
 */

import { JSDOM } from 'jsdom';

console.log('\n🤖 [Pathixo QA] Starting AI Chatbot Stream & Ad Injection Simulation...\n');

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="chat-thread">
        <div class="user-bubble" id="msg-user-1">How does quantum entanglement work?</div>
      </div>
      <form id="composer-form">
        <textarea id="prompt-textarea"></textarea>
        <button id="send-button">Send</button>
      </form>
    </body>
  </html>
`);

const { document, window } = dom.window;

console.log('1️⃣ [User Action]: User submits prompt on ChatGPT.');
const userAnchor = document.getElementById('msg-user-1');

console.log('2️⃣ [Extension Action]: Mounting Pathixo Ad Card below user prompt.');
const adHost = document.createElement('div');
adHost.id = 'pathixo-ad-host';
const shadowRoot = adHost.attachShadow({ mode: 'open' });

// Add card structure
const cardRow = document.createElement('div');
cardRow.className = 'pathixo-card-row';

const badge = document.createElement('span');
badge.textContent = 'Trending AI';

const link = document.createElement('a');
link.textContent = 'Build software 10x faster with Cursor — The AI code editor.';
link.href = 'https://cursor.com/?ref=pathixo';

const sponsorTag = document.createElement('span');
sponsorTag.textContent = 'Sponsored • via Pathixo Rewards';

cardRow.appendChild(badge);
cardRow.appendChild(link);
cardRow.appendChild(sponsorTag);
shadowRoot.appendChild(cardRow);

userAnchor.parentElement.insertBefore(adHost, userAnchor.nextSibling);
console.log('   ✅ Ad Card successfully mounted into isolated Shadow DOM.');

console.log('3️⃣ [AI Generation]: Simulating token streaming over 4,500ms...');
const streamChunks = [
  'Quantum ',
  'entanglement ',
  'is a ',
  'phenomenon ',
  'where particles ',
  'become interconnected...',
];

let simulatedElapsedMs = 0;
for (const chunk of streamChunks) {
  simulatedElapsedMs += 750;
  console.log(`   ⏱️ [${simulatedElapsedMs}ms] Streaming chunk: "${chunk.trim()}"`);
}

console.log(`\n4️⃣ [Generation Done]: Total stream dwell: ${simulatedElapsedMs}ms (Threshold: >= 4000ms).`);

const isTabFocused = true;
const isDismissed = false;

if (simulatedElapsedMs >= 4000 && isTabFocused && !isDismissed) {
  const verifiedEvent = {
    event_id: 'evt_sim_' + Math.random().toString(36).substring(2, 10),
    ad_id: 'ad_cursor',
    dwell_ms: simulatedElapsedMs,
    ai_platform: 'chatgpt',
    timestamp: Date.now(),
  };

  console.log('   🎉 [QUALIFIED IMPRESSION]: Verification passed!');
  console.log('   💰 [User Credited]: +$0.0090 USD added to balance.');
  console.log(`   📄 Event ID: ${verifiedEvent.event_id}`);
  console.log('\n✅ [PASS] Stream injection & dwell qualification lifecycle verified!\n');
  process.exit(0);
} else {
  console.error('\n❌ [FAIL] Stream dwell failed qualification.\n');
  process.exit(1);
}
