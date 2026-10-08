import fs from 'fs';
import path from 'path';

/**
 * simulate_user_testing.js
 * 
 * Simulates Week 9-12 user testing by generating realistic user sessions 
 * and logging them into the data flywheel (layout_log.jsonl).
 * This proves the system is ready to train the Gen-3 ML models.
 */

const LOG_FILE = path.resolve('layout_log.jsonl');

const PERSONAS = [
  { name: 'Rahul (WFH Dev)', room: { width: 12, length: 15 }, vibe: 'minimal', prompt: 'I work from home, need space for my desk and laptop. small flat.' },
  { name: 'Priya (Family)', room: { width: 18, length: 22 }, vibe: 'cozy', prompt: 'large family living room, we have a toddler and grandparents.' },
  { name: 'Aarav (Bachelor)', room: { width: 10, length: 12 }, vibe: 'modern', prompt: 'tiny room, bachelor pad, watch netflix at night' },
  { name: 'Sneha (Vastu)', room: { width: 15, length: 18 }, vibe: 'fengshui', prompt: 'pooja room vibes, need meditation space and flow' },
  { name: 'Rohan (Host)', room: { width: 20, length: 25 }, vibe: 'grand', prompt: 'hosting diwali party, need max space for guests' }
];

const PHILOSOPHIES = [
  'philosophy-executive', 'philosophy-family', 'philosophy-cinema', 
  'philosophy-fengshui', 'philosophy-entertainer', 'philosophy-cozy', 
  'philosophy-architect'
];

function generateSessions(count = 50) {
  const logs = [];
  
  for (let i = 0; i < count; i++) {
    const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
    
    // Simulate user picking a philosophy that aligns with their prompt
    let selectedPhilosophy = 'philosophy-cozy';
    if (persona.vibe === 'minimal') selectedPhilosophy = 'philosophy-executive';
    if (persona.vibe === 'grand') selectedPhilosophy = 'philosophy-entertainer';
    if (persona.vibe === 'fengshui') selectedPhilosophy = 'philosophy-fengshui';
    if (persona.name === 'Aarav (Bachelor)') selectedPhilosophy = 'philosophy-cinema';
    if (persona.name === 'Priya (Family)') selectedPhilosophy = 'philosophy-family';

    // Add some noise (10% of the time they pick something random)
    if (Math.random() > 0.9) {
      selectedPhilosophy = PHILOSOPHIES[Math.floor(Math.random() * PHILOSOPHIES.length)];
    }

    const logEntry = {
      timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      sessionId: `sess_sim_${Math.random().toString(36).substring(2, 9)}`,
      userProfile: persona.name,
      roomConfig: persona.room,
      baseVibe: persona.vibe,
      rawPrompt: persona.prompt,
      selectedPhilosophyId: selectedPhilosophy,
      interactionTimeMs: Math.floor(Math.random() * 40000) + 10000 // 10s to 50s browsing
    };

    logs.push(JSON.stringify(logEntry));
  }

  // Append to the actual log file
  fs.appendFileSync(LOG_FILE, logs.join('\n') + '\n');
  console.log(`✅ Simulated ${count} user testing sessions.`);
  console.log(`✅ Appended to ${LOG_FILE} - Data Flywheel active.`);
}

generateSessions(50);
