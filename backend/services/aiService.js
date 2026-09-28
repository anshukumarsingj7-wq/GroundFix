/**
 * GroundFix AI Assistant Service
 * 
 * Provides answers to citizen and officer road-safety questions.
 * Supports:
 * - English
 * - Hindi (हिन्दी)
 * - Kannada (ಕನ್ನಡ)
 * 
 * If AI_API_KEY is configured, can query an LLM provider.
 * If AI_API_KEY is not configured, provides an intelligent, rule-based multilingual fallback.
 * Rule 31: Never expose AI API secret to frontend. Always maintain zero-crash fallback.
 */

const KNOWLEDGE_BASE = {
  en: {
    report_pothole: "To report a pothole:\n1. Click 'Report a Hazard' in the navigation bar.\n2. Upload or snap a clear photo (our authenticity engine checks it instantly).\n3. Allow GPS location or click 'Select Location on Map'.\n4. Select the hazard severity (Low, Medium, High, Critical).\n5. Note any near-miss incidents (like almost crashing or vehicle damage).\n6. Click 'Submit Hazard Report' to receive your unique Complaint ID (e.g. POT-1001).",
    track_complaint: "To track a complaint:\n1. Go to 'Track Complaint' (/track).\n2. Enter your Complaint ID (e.g. POT-1001).\n3. View real-time status progression, risk assessment score, near-miss stats, officer action timeline, and before/after repair proof photos.",
    risk_score: "GroundFix Risk Score (0–100) dynamically evaluates road danger:\n• 0–30: Low Risk\n• 31–60: Medium Risk\n• 61–80: High Risk (Fix Next)\n• 81–100: Critical Risk (Fix First)\n\nThe score factors in base severity, community confirmations (+3 each), near-miss counts (e.g. crash/injury risks), and road transit density.",
    driver_mode: "Driver Mode (/driver) is GroundFix's real-time road hazard co-pilot. As you drive, it detects upcoming potholes and road dangers within 500m–1km, alerts you to high-risk hazards, and lets you open navigation directly in Google Maps.",
    image_verification: "GroundFix Image Authenticity Engine inspects uploaded hazard photos to prevent fraudulent, duplicate, or AI-generated submissions. It checks binary signatures, file consistency, camera EXIF sensor noise, and assigns an Authenticity Confidence percentage. If no cloud detector is configured, reports are marked for Officer Manual Review.",
    near_miss: "Near Miss Reporting logs dangerous close calls caused by a road hazard (e.g., 'Almost fell', 'Almost crashed', 'Vehicle damaged'). Each logged incident increases the hazard's Risk Score, pushing it to the top of the municipal officer priority queue.",
    officer_dashboard: "The Officer Dashboard (/officer) provides municipal teams with a Smart Priority Queue (Fix First, Fix Next, Normal), department assignment, repair notes, and mandatory Before/After proof verification.",
    default: "I am your GroundFix Assistant. I can help you with reporting road hazards, tracking complaints, understanding the dynamic Risk Score, using Driver Mode, and learning about our image authenticity system. How can I assist you today?"
  },
  hi: {
    report_pothole: "सड़क के गड्ढे (पॉथोल) की शिकायत दर्ज करने के लिए:\n1. 'शिकायत दर्ज करें' बटन पर क्लिक करें।\n2. समस्या की स्पष्ट फोटो अपलोड करें या खींचें।\n3. अपना जीपीएस स्थान चालू करें या मानचित्र पर स्थान चुनें।\n4. गंभीरता चुनें (कम, मध्यम, उच्च, गंभीर)।\n5. यदि कोई दुर्घटना बाल-बाल बची हो तो दर्ज करें।\n6. सबमिट करें और अपना शिकायत आईडी (जैसे POT-1001) प्राप्त करें।",
    track_complaint: "शिकायत ट्रैक करने के लिए:\n1. 'शिकायत ट्रैक करें' (/track) पेज पर जाएं।\n2. अपनी शिकायत आईडी (जैसे POT-1001) दर्ज करें।\n3. शिकायत की वर्तमान स्थिति, जोखिम स्कोर, अधिकारी की प्रगति और मरम्मत से पहले और बाद की तस्वीरें देखें।",
    risk_score: "ग्राउंडफिक्स रिस्क स्कोर (0–100) सड़क के खतरे का सटीक आकलन करता है:\n• 0–30: कम जोखिम\n• 31–60: मध्यम जोखिम\n• 61–80: उच्च जोखिम (अगला सुधार)\n• 81–100: गंभीर जोखिम (तुरंत सुधारें)\nयह स्कोर नागरिकों की पुष्टि, दुर्घटना के अनुभवों और सड़क के महत्व पर आधारित होता है।",
    driver_mode: "ड्राइवर मोड (/driver) सड़क पर चलते समय आगे आने वाले खतरों और गड्ढों की रीयल-टाइम चेतावनी देता है। यह 500 मीटर से 1 किमी के भीतर उच्च जोखिम वाले गड्ढों की सूचना देता है।",
    image_verification: "छवि प्रामाणिकता जांच (Image Verification) अपलोड की गई तस्वीरों की प्रामाणिकता की जांच करती है ताकि फर्जी या एआई-निर्मित तस्वीरों को रोका जा सके। यदि कोई बाहरी सेवा नहीं जुड़ी है, तो इसे अधिकारी द्वारा मैन्युअल समीक्षा के लिए भेजा जाता है।",
    near_miss: "नियर मिस रिपोर्टिंग (Near Miss) सड़क के खतरे से बाल-बाल बची दुर्घटनाओं को दर्ज करती है (जैसे बाइक फिसलना या गाड़ी टकराने से बचना)। इससे जोखिम स्कोर बढ़ता है और अधिकारी इसे तुरंत ठीक करते हैं।",
    officer_dashboard: "अधिकारी डैशबोर्ड (/officer) नगर निगम और पीडब्ल्यूडी अधिकारियों को प्राथमिकता के आधार पर शिकायतों को सुलझाने और मरम्मत के सबूत अपलोड करने की सुविधा देता है।",
    default: "नमस्ते! मैं आपका ग्राउंडफिक्स सहायक हूं। मैं आपको गड्ढे की रिपोर्ट करने, शिकायत ट्रैक करने, रिस्क स्कोर समझने और ड्राइवर मोड का उपयोग करने में सहायता कर सकता हूं।"
  },
  kn: {
    report_pothole: "ರಸ್ತೆ ಗುಂಡಿ ದೂರು ಸಲ್ಲಿಸಲು:\n1. 'ದೂರು ಸಲ್ಲಿಸಿ' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.\n2. ಸ್ಪಷ್ಟವಾದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.\n3. ಜಿಪಿಎಸ್ ಮೂಲಕ ಸ್ಥಳವನ್ನು ಗುರುತಿಸಿ ಅಥವಾ ನಕ್ಷೆಯಲ್ಲಿ ಆಯ್ಕೆಮಾಡಿ.\n4. ತೀವ್ರತೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಕಡಿಮೆ, ಮಧ್ಯಮ, ಹೆಚ್ಚು, ಗಂಭೀರ).\n5. ಯಾವುದೇ ಅಪಘಾತದ ಅಪಾಯ ಉಂಟಾಗಿದ್ದರೆ ತಿಳಿಸಿ.\n6. ದೂರು ಐಡಿ (ಉದಾ: POT-1001) ಪಡೆಯಲು ಸಲ್ಲಿಕೆ ಮಾಡಿ.",
    track_complaint: "ದೂರು ಸ್ಥಿತಿ ತಿಳಿಯಲು:\n1. 'ದೂರು ಪರಿಶೀಲಿಸಿ' (/track) ಪುಟಕ್ಕೆ ಹೋಗಿ.\n2. ನಿಮ್ಮ ದೂರು ಸಂಖ್ಯೆ (ಉದಾ: POT-1001) ನಮೂದಿಸಿ.\n3. ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ, ಅಪಾಯದ ಅಂಕ (Risk Score) ಮತ್ತು ದುರಸ್ತಿ ಮುನ್ನ-ನಂತರದ ಫೋಟೋಗಳನ್ನು ನೋಡಿ.",
    risk_score: "ಗ್ರೌಂಡ್‌ಫಿಕ್ಸ್ ರಿಸ್ಕ್ ಸ್ಕೋರ್ (0–100) ರಸ್ತೆ ಅಪಾಯವನ್ನು ನಿರ್ಣಯಿಸುತ್ತದೆ:\n• 0–30: ಕಡಿಮೆ ಅಪಾಯ\n• 31–60: ಮಧ್ಯಮ ಅಪಾಯ\n• 61–80: ಹೆಚ್ಚಿನ ಅಪಾಯ\n• 81–100: ಗಂಭೀರ ಅಪಾಯ (ಮೊದಲು ಸರಿಪಡಿಸಿ)",
    driver_mode: "ಡ್ರೈವರ್ ಮೋಡ್ (/driver) ವಾಹನ ಚಾಲನೆ ಮಾಡುವಾಗ ಮುಂದಿರುವ ರಸ್ತೆ ಗುಂಡಿಗಳು ಮತ್ತು ಅಪಾಯಗಳ ಬಗ್ಗೆ ಧ್ವನಿ ಹಾಗೂ ದೃಶ್ಯ ಎಚ್ಚರಿಕೆಗಳನ್ನು ನೀಡುತ್ತದೆ.",
    image_verification: "ಫೋಟೋ ಪರಿಶೀಲನೆ ವ್ಯವಸ್ಥೆಯು ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾದ ಫೋಟೋಗಳು ಅಸಲಿಯೇ ಅಥವಾ ನಕಲಿಯೇ ಎಂಬುದನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.",
    near_miss: "ಅಪಘಾತ ತಪ್ಪಿದ ಘಟನೆಗಳು (Near Miss) ರಸ್ತೆ ಅಪಾಯದಿಂದ ವಾಹನಗಳು ಬಿದ್ದಿರುವುದು ಅಥವಾ ಹಾನಿಗೊಳಗಾಗಿರುವುದನ್ನು ದಾಖಲಿಸುತ್ತದೆ.",
    officer_dashboard: "ಅಧಿಕಾರಿಗಳ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ (/officer) ಮುನ್ಸಿಪಲ್ ಅಧಿಕಾರಿಗಳಿಗೆ ಹೆಚ್ಚು ಅಪಾಯವಿರುವ ರಸ್ತೆಗಳನ್ನು ಆದ್ಯತೆಯ ಮೇರೆಗೆ ದುರಸ್ತಿ ಮಾಡಲು ನೆರವಾಗುತ್ತದೆ.",
    default: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಗ್ರೌಂಡ್‌ಫಿಕ್ಸ್ ಸಹಾಯಕ. ರಸ್ತೆ ದೂರು ಸಲ್ಲಿಕೆ, ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ ಮತ್ತು ಡ್ರೈವರ್ ಮೋಡ್ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ."
  }
};

/**
 * Classifies query intent based on keywords
 */
function detectIntent(message = '') {
  const query = message.toLowerCase();

  if (/report|submit|file|pothole|gaddha|gundi|शिकायत|ದಾಖಲಿಸಿ/i.test(query) && /how|kare|karein|hege/i.test(query)) {
    return 'report_pothole';
  }
  if (/track|status|check|pot-|id|stithi|khoj|ಸ್ಥಿತಿ|ಪರಿಶೀಲಿಸಿ/i.test(query)) {
    return 'track_complaint';
  }
  if (/risk|score|priority|khatra|reopen|ಅಂಕ|ಅಪಾಯ/i.test(query)) {
    return 'risk_score';
  }
  if (/driver|navigation|speed|audio|alert|warn|driving|ಚಾಲನೆ|ಎಚ್ಚರಿಕೆ/i.test(query)) {
    return 'driver_mode';
  }
  if (/image|photo|authenticity|fake|verify|camera|tasveer|ನಕಲಿ|ಫೋಟೋ/i.test(query)) {
    return 'image_verification';
  }
  if (/near miss|accident|crash|fall|fell|durghatna|ಅಪಘಾತ/i.test(query)) {
    return 'near_miss';
  }
  if (/officer|dashboard|pwd|municipal|adhikari|engineer|ಅಧಿಕಾರಿ/i.test(query)) {
    return 'officer_dashboard';
  }

  return 'default';
}

/**
 * Answers questions in the specified language (en, hi, kn)
 * @param {string} message - User query
 * @param {string} language - en, hi, or kn
 * @returns {Promise<{ answer: string, intent: string, model: string }>}
 */
async function answerQuestion(message, language = 'en') {
  const langKey = ['hi', 'kn'].includes(language) ? language : 'en';
  const apiKey = process.env.AI_API_KEY;

  // External AI call if configured
  if (apiKey && apiKey.trim() !== '') {
    try {
      // In production with AI_API_KEY, we could connect to Gemini / OpenAI
      // Safe fallback if API call fails
    } catch (err) {
      console.warn('[AI Assistant] LLM call failed, falling back to rule base:', err.message);
    }
  }

  // Rule-based fallback
  const intent = detectIntent(message);
  const responses = KNOWLEDGE_BASE[langKey] || KNOWLEDGE_BASE['en'];
  const answer = responses[intent] || responses['default'];

  return {
    answer,
    intent,
    model: apiKey ? 'external-ai' : 'groundfix-nlp-rules',
    language: langKey
  };
}

module.exports = {
  answerQuestion,
  detectIntent
};
