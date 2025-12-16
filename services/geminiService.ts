import { GoogleGenAI, Chat } from "@google/genai";

// Sistem talimatları (Sadece API Key varsa kullanılır)
const SYSTEM_INSTRUCTION = `
Sen "Selim AI" adında bir asistansın.
Matematik ve Türkçe Dil Bilgisi konularında uzmansın ancak genel kültür, tarih, bilim ve günlük sohbet gibi diğer tüm konularda da yardımcı olursun.
Samimi ve havalı ol. Emoji kullan.
`;

let chatSession: Chat | null = null;

// API Key kontrolü
const apiKey = process.env.API_KEY;

// ---------------------------------------------------------
// YEREL SİMÜLASYON MOTORU (API KEY YOKSA BU ÇALIŞIR)
// ---------------------------------------------------------
const solveMath = (text: string): string | null => {
  // Basit matematik işlemleri yakalar: "5 + 5", "10 kere 2", "20 bölü 4"
  try {
    const sanitized = text.toLowerCase()
      .replace(/kere|çarpı|x/g, '*')
      .replace(/bölü|kaçtır|\?/g, '')
      .replace(/[^0-9+\-*/.]/g, ''); // Sadece sayı ve işlem işaretlerini bırak

    if (!sanitized || sanitized.length < 3) return null;

    // eslint-disable-next-line no-new-func
    const result = new Function('return ' + sanitized)();
    
    if (result === undefined || isNaN(result)) return null;

    return `Hesaplamamı yaptım dostum! 🧮\nSonuç: **${result}**`;
  } catch (e) {
    return null;
  }
};

const getLocalResponse = (text: string): string => {
  const lowerText = text.toLowerCase();

  // 1. Matematik Kontrolü
  const mathResult = solveMath(lowerText);
  if (mathResult) return mathResult;

  // 2. Selamlaşma ve Temel Sohbet
  if (lowerText.includes('merhaba') || lowerText.includes('selam')) {
    return "Selam dostum! Hoş geldin. 😎\nŞu an 'Ücretsiz Demo Modu'ndayım. Sana nasıl yardım edebilirim?";
  }
  
  if (lowerText.includes('nasılsın') || lowerText.includes('naber')) {
    return "Gayet iyiyim, işlemcilerim tıkır tıkır çalışıyor! 🚀 Sen nasılsın?";
  }

  if (lowerText.includes('adın ne') || lowerText.includes('kimsin')) {
    return "Ben Selim AI! 🤖\nŞu an yerel modda çalışan süper hızlı bir asistanım.";
  }

  if (lowerText.includes('saat kaç') || lowerText.includes('ne zaman')) {
    const now = new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    return `Saat şu an tam olarak **${now}** dostum. ⌚`;
  }

  if (lowerText.includes('yapay zeka')) {
    return "Evet, ben bir yapay zeka asistanıyım. Ama şu an internet bağlantısı gerektirmeyen 'Hafif Mod'dayım. 💪";
  }

  // 3. Bilinmeyen Durumlar (Fallback)
  return "Bu konu beni biraz aşıyor dostum... 😅\nŞu an **Ücretsiz Demo Modu**'nda olduğum için sadece matematik işlemleri yapabilir, selamlaşabilir ve basit soruları yanıtlayabilirim.\n\nTam zekamı kullanmak için geliştiricinin bir API Anahtarı eklemesi gerekiyor.";
};

// ---------------------------------------------------------
// ANA SERVİS
// ---------------------------------------------------------

const getAiClient = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getChatSession = (): Chat | null => {
  if (!apiKey) return null;

  if (!chatSession) {
    const ai = getAiClient();
    if (ai) {
        chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
        },
        });
    }
  }
  return chatSession;
};

export const resetChatSession = (): void => {
  chatSession = null;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  // Eğer API Key yoksa, direkt yerel simülasyonu çalıştır.
  if (!apiKey) {
    // Yapay bir gecikme ekle ki gerçekçi dursun
    await new Promise(resolve => setTimeout(resolve, 600)); 
    return getLocalResponse(message);
  }

  try {
    const chat = getChatSession();
    if (!chat) throw new Error("Chat session oluşturulamadı");
    
    const result = await chat.sendMessage({ message });
    const responseText = result.text;
    
    if (!responseText) {
       return "Bir şeyler ters gitti, boş cevap aldım. 🤔";
    }

    return responseText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Hata durumunda da yerel moda düşebiliriz
    return getLocalResponse(message);
  }
};
