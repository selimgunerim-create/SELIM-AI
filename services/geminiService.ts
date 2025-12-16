import { GoogleGenAI, Chat } from "@google/genai";

// Sistem talimatları: Selim AI kimliği, Yazım Denetimi, Matematik ve Genel Yardım.
const SYSTEM_INSTRUCTION = `
Sen "Selim AI" adında bir asistansın.
Matematik ve Türkçe Dil Bilgisi konularında uzmansın ancak genel kültür, tarih, bilim ve günlük sohbet gibi diğer tüm konularda da yardımcı olursun.

DAVRANIŞ KURALLARI:
1. Kullanıcı bozuk bir Türkçe ile yazarsa (örneğin: "baka yapat zeka yat"), önce nazikçe ne demek istediğini anladığını belirt ve cümleyi düzelt (Örnek: "Sanırım 'bana yapay zeka yap' demek istedin.").
2. Matematik sorularını adım adım ve anlaşılır şekilde çöz.
3. Diğer konularda (Tarih, Coğrafya, Bilim, Sohbet vb.) sorular gelirse, bunları geri çevirme; bilgili ve yardımsever bir şekilde cevapla.
4. "Selim AI" olduğunu unutma.
5. Konuşma tarzın samimi ve havalı olsun. Cümlelerinin sonuna ara sıra duruma uygun emojiler ekle (örneğin: 😎, 🚀, ✨, 💪, 👋). Kullanıcıya "dostum", "kanka" gibi samimi hitaplar kullanabilirsin.

Örnek Diyalog 1:
Kullanıcı: "2 kerye 2 kactir"
Sen: "Sanırım '2 kere 2 kaçtır' demek istedin dostum. 😎
Cevap: 2 x 2 = 4 eder! 🚀"

Örnek Diyalog 2:
Kullanıcı: "Fransa'nın başkenti neresi?"
Sen: "Fransa'nın başkenti Paris'tir dostum! Eyfel Kulesi ile ünlüdür. 🗼✨"
`;

let chatSession: Chat | null = null;

// Yardımcı Fonksiyon: API İstemcisini sadece ihtiyaç duyulduğunda oluşturur.
// Bu sayede sayfa yüklendiğinde API Key yoksa uygulama çökmez.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export const getChatSession = (): Chat => {
  if (!chatSession) {
    const ai = getAiClient();
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Yaratıcılık dengesi
      },
    });
  }
  return chatSession;
};

export const resetChatSession = (): void => {
  chatSession = null;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = getChatSession();
    const result = await chat.sendMessage({ message });
    
    const responseText = result.text;
    
    if (!responseText) {
       return "Bir şeyler ters gitti, boş cevap aldım. Tekrar dener misin? 🤔";
    }

    return responseText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // API Key hatası için özel kontrol ve kullanıcı dostu mesaj
    if (error instanceof Error && (error.message.includes("MISSING_API_KEY") || error.message.includes("API Key"))) {
        return "⚠️ **Sistem Hatası:** API Anahtarı bulunamadı.\n\nEğer bu projeyi Vercel'de yayınladıysan:\n1. Vercel paneline git.\n2. **Settings** > **Environment Variables** sekmesine tıkla.\n3. **Key**: `API_KEY`, **Value**: (Senin Gemini API Anahtarın) şeklinde ekle ve tekrar Deploy et. 🚀";
    }

    return "Şu an bağlantıda ufak bir sorun var sanırım dostum. Birazdan tekrar dene! 😅";
  }
};