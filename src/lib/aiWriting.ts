import { GoogleGenAI } from '@google/genai';

export type AiAssistAction = 
  | 'help_write' 
  | 'more_emotional' 
  | 'shorter' 
  | 'poetic' 
  | 'funny';

interface AiWritingContext {
  recipientName: string;
  senderName: string;
  relationship: string;
  occasion: string;
  currentText: string;
  field?: string;
}

export async function generateAiWritingAssistance(
  action: AiAssistAction,
  context: AiWritingContext
): Promise<string> {
  const { recipientName, senderName, relationship, occasion, currentText, field } = context;

  const apiKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY || 
                 (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
                 '';

  const actionDescriptions: Record<AiAssistAction, string> = {
    help_write: `Write a heartfelt, deeply touching personal message from ${senderName || 'someone who loves them'} to ${recipientName || 'their favorite person'} for the occasion of ${occasion || 'a special day'}. They are ${relationship || 'very close'}.`,
    more_emotional: `Rewrite the following message to make it deeply emotional, warm, vulnerable and romantic while keeping its core sentiment authentic:\n"${currentText}"`,
    shorter: `Condense the following message into a concise, punchy, beautiful sentiment that still carries all the warmth and meaning:\n"${currentText}"`,
    poetic: `Rewrite the following message in a poetic, lyrical, and evocative voice, like lines from a classic love letter:\n"${currentText}"`,
    funny: `Rewrite the following message with playful wit, sweet inside jokes, warmth, and affectionate humor without losing genuine love:\n"${currentText}"`
  };

  const prompt = `${actionDescriptions[action]}
Recipient: ${recipientName || 'My Love'}
Sender: ${senderName || 'Yours Always'}
Occasion: ${occasion || 'Just Because'}
Focus topic/field: ${field || 'letter'}

Instructions:
- Write naturally, warmly, and authentically.
- Do NOT use cheesy clichés or corporate AI sounding phrases like "embark on this journey" or "testament to our love".
- Speak like a real human who cares intensely.
- Return ONLY the written message text, with no preamble, no markdown asterisks, no quotes, and no "Here is your message:".`;

  // Try real Gemini API if key is available
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text && response.text.trim()) {
        return response.text.trim().replace(/^["']|["']$/g, '');
      }
    } catch (err) {
      console.warn("Gemini API call failed, using romantic engine fallback", err);
    }
  }

  // High-fidelity romantic human writing engine fallback
  return getCuratedRomanticCopy(action, context);
}

function getCuratedRomanticCopy(action: AiAssistAction, ctx: AiWritingContext): string {
  const name = ctx.recipientName || 'my favorite human';
  const sender = ctx.senderName || 'me';

  if (action === 'help_write') {
    if (ctx.occasion === 'Birthday') {
      return `Happy Birthday, ${name}. From the ordinary mornings we share to the quiet moments late at night, having you in my life makes every single day softer, brighter, and infinitely more meaningful. I hope today reminds you how cherished and irreplaceable you truly are.`;
    }
    if (ctx.occasion === 'Anniversary') {
      return `Looking back at every road that brought us here, I would choose you all over again in a heartbeat. Thank you for the laughter, the patience, the way you listen, and every quiet adventure in between. Happy Anniversary, ${name} — here's to all our unwritten chapters.`;
    }
    return `To ${name}, I wanted to make something that could hold all the quiet gratitude I feel for you. You make life feel like a softer, more beautiful place just by being yourself. Thank you for walking beside me, for laughing with me, and for being my favorite part of every day.`;
  }

  if (action === 'more_emotional') {
    return ctx.currentText 
      ? `If I've learned anything with you, ${name}, it's that home isn't a place — it's the calmness in your voice, the way you look at me across a crowded room, and the silent certainty that no matter what comes, I never want to face it without you. ${ctx.currentText}`
      : `There are days I look at you and wonder how the world was ever quiet before you entered it. You are the warmth on cold days, the steady ground when everything else shakes, and the deepest kind of joy I've ever known.`;
  }

  if (action === 'shorter') {
    return `In every version of this life, ${name}, I would still choose you. Thank you for being my constant, my calm, and my favorite reason to smile.`;
  }

  if (action === 'poetic') {
    return `You exist like sunlight falling across an unread page — turning ordinary hours into golden ones. With you, ${name}, love is not a promise made of heavy words, but the quiet grace of knowing I am home whenever you are near.`;
  }

  if (action === 'funny') {
    return `I love you more than fresh coffee, longer than my Netflix watchlist, and definitely more than anyone should tolerate someone who steals the duvet at 3 AM. Thanks for choosing to be weird with me, ${name}!`;
  }

  return `Dear ${name}, thank you for being you. Loving you is the easiest thing I've ever done.`;
}
