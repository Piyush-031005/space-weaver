/**
 * AI Roast Critic Engine
 * Sends real geometric scores to an LLM to generate witty, shareable critiques.
 */

export async function generateRoast(clearanceScores, genome, collisions) {
  // If no API key is provided, return mock roasts for scaffolding/testing
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not found. Returning mock roasts.");
    return [
      `With a walking comfort of ${clearanceScores.walkingComfort}%, your sofa blocks the only path to the door 🙃`,
      `Your room's 'Calm' score is ${genome.scores.calm}%. It looks like a furniture store exploded.`,
      collisions.length > 0 ? `You have ${collisions.length} overlapping items. Physics doesn't work that way.` : `At least your furniture isn't merging into each other.`
    ];
  }

  // Real LLM Integration
  const promptData = {
    clearanceScores,
    genomeScores: genome.scores,
    archetype: genome.archetype,
    collisionCount: collisions.length
  };

  const systemPrompt = `You are a witty, slightly savage interior design critic. 
Given these room metrics, write 3 short, funny, shareable one-liner critiques pointing at real numeric weak points 
(e.g., low walkingComfort, low cleaningAccess). Be specific to the numbers given. 
Never invent facts not in the data. 
Format your response as a valid JSON array of strings.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // Fast model for cheap/quick roasts
        max_tokens: 150,
        system: systemPrompt,
        messages: [
          { role: "user", content: JSON.stringify(promptData) }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Attempt to parse the text response as JSON (since we asked for a JSON array)
    try {
      const roasts = JSON.parse(data.content[0].text);
      return Array.isArray(roasts) ? roasts : ["Wow, nice room.", "No, seriously.", "It's fine."];
    } catch (e) {
      // Fallback if LLM didn't return valid JSON
      return [data.content[0].text];
    }
  } catch (error) {
    console.error("Failed to generate roast:", error);
    return ["Your layout is so chaotic it broke our AI critic."];
  }
}
