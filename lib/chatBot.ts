// Smart FAQ bot - keyword matching, no API needed, completely free

interface BotRule {
  keywords: string[];
  reply: string;
  replyHi?: string;
}

const rules: BotRule[] = [
  // Greetings
  { keywords: ['hi', 'hello', 'hey', 'hii', 'helo', 'namaste', 'namaskar'],
    reply: 'Hello! Welcome to School Bus WayPro support. How can I help you today?',
    replyHi: 'नमस्ते! स्कूल बस वेप्रो सहायता में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूं?' },

  // Fee related
  { keywords: ['pay', 'fee', 'payment', 'dues', 'amount', 'money', 'bhugtan', 'shulk', 'paisa'],
    reply: 'To pay fees:\n1. Go to "Payments" from bottom menu\n2. Select your child\n3. Click "Pay Now" on pending month\n4. Choose UPI App, Card, or QR Code\n\nYou can also download receipts for paid months.',
    replyHi: 'शुल्क भुगतान के लिए:\n1. नीचे मेनू से "भुगतान" पर जाएं\n2. अपने बच्चे को चुनें\n3. लंबित महीने पर "अभी भुगतान करें" पर क्लिक करें\n4. UPI ऐप, कार्ड या QR कोड चुनें' },

  // Receipt
  { keywords: ['receipt', 'download', 'invoice', 'pdf', 'raseed', 'bill'],
    reply: 'To download receipt:\n1. Go to "Payments"\n2. Find the paid month\n3. Click the three dots (⋮)\n4. Choose PDF, Invoice, or Receipt format\n\nThe file will be saved to your Downloads folder.',
    replyHi: 'रसीद डाउनलोड करने के लिए:\n1. "भुगतान" पर जाएं\n2. भुगतान किया हुआ महीना खोजें\n3. तीन बिंदु (⋮) पर क्लिक करें\n4. PDF, इनवॉइस या रसीद चुनें' },

  // Tracking / Bus location
  { keywords: ['track', 'bus', 'location', 'where', 'gps', 'map', 'kahan', 'kidhar'],
    reply: 'To track your child\'s bus:\n1. Go to Dashboard\n2. If tracking is enabled, you\'ll see "Live Tracking" in the menu\n3. The map shows real-time bus location\n\nIf tracking is not visible, contact admin to enable it.',
    replyHi: 'बस ट्रैक करने के लिए:\n1. डैशबोर्ड पर जाएं\n2. यदि ट्रैकिंग सक्षम है, तो मेनू में "लाइव ट्रैकिंग" दिखेगा\n3. मैप पर बस की रियल-टाइम स्थिति दिखेगी' },

  // Attendance
  { keywords: ['attendance', 'absent', 'present', 'pickup', 'drop', 'upasthiti', 'hajri'],
    reply: 'To check attendance:\n1. Go to "Attendance History" from the sidebar\n2. Use Year and Month filters to find specific dates\n3. You can filter by Pickup or Drop\n\nStudent Profile also shows last 10 attendance records.',
    replyHi: 'उपस्थिति जांचने के लिए:\n1. साइडबार से "उपस्थिति इतिहास" पर जाएं\n2. विशिष्ट तारीखों के लिए वर्ष और महीने के फिल्टर का उपयोग करें\n3. आप पिकअप या ड्रॉप द्वारा फिल्टर कर सकते हैं' },

  // Route / Boarding point
  { keywords: ['route', 'stop', 'boarding', 'point', 'marg', 'rasta'],
    reply: 'To view your route:\n1. Go to "Routes" from the menu\n2. You\'ll see route name, start/end points, bus number\n3. Your boarding point is also shown\n\nTo change boarding point, contact bus admin.',
    replyHi: 'अपना मार्ग देखने के लिए:\n1. मेनू से "मार्ग" पर जाएं\n2. मार्ग का नाम, शुरू/अंत बिंदु, बस नंबर दिखेगा\n3. आपका बोर्डिंग पॉइंट भी दिखाया गया है' },

  // Profile / Account
  { keywords: ['profile', 'name', 'email', 'phone', 'photo', 'image', 'password', 'account'],
    reply: 'To edit your profile:\n1. Go to Profile > Edit Profile\n2. Update name, email, phone number\n3. Click camera icon to upload profile photo\n\nTo change password:\n1. Go to Profile > Password Reset\n2. Enter new password and confirm',
    replyHi: 'प्रोफाइल संपादित करने के लिए:\n1. प्रोफाइल > प्रोफाइल संपादित करें\n2. नाम, ईमेल, फोन नंबर अपडेट करें\n3. फोटो अपलोड करने के लिए कैमरा आइकन पर क्लिक करें' },

  // Language
  { keywords: ['language', 'hindi', 'english', 'bhasha', 'lang'],
    reply: 'To change language:\n1. Go to Profile > Language\n2. Select English or Hindi\n3. The app will switch immediately\n\nYou can also change from the avatar dropdown in top bar.',
    replyHi: 'भाषा बदलने के लिए:\n1. प्रोफाइल > भाषा पर जाएं\n2. अंग्रेजी या हिंदी चुनें\n3. ऐप तुरंत बदल जाएगा' },

  // Late fee
  { keywords: ['late', 'fine', 'penalty', 'overdue', 'jurmana', 'deri'],
    reply: 'Late fees are charged automatically after the due date:\n• Grace period is set by admin (usually 5-7 days)\n• Daily penalty is applied after grace period\n• Maximum late fee cap is set by admin\n\nPay before the due date to avoid late fees!',
    replyHi: 'विलंब शुल्क देय तिथि के बाद स्वचालित रूप से लगाया जाता है:\n• अनुग्रह अवधि एडमिन द्वारा निर्धारित (आमतौर पर 5-7 दिन)\n• अनुग्रह अवधि के बाद दैनिक जुर्माना लागू\n\nविलंब शुल्क से बचने के लिए समय पर भुगतान करें!' },

  // Notification
  { keywords: ['notification', 'alert', 'suchana', 'message'],
    reply: 'You receive notifications for:\n• Bus departure and arrival\n• Fee payment reminders\n• Payment confirmations\n• Route changes\n• Attendance alerts\n\nCheck the bell icon in top bar for latest alerts.',
    replyHi: 'आपको इन के लिए सूचनाएं मिलती हैं:\n• बस प्रस्थान और आगमन\n• शुल्क भुगतान रिमाइंडर\n• भुगतान पुष्टि\n• मार्ग परिवर्तन\n• उपस्थिति अलर्ट' },

  // Contact admin
  { keywords: ['admin', 'contact', 'help', 'support', 'problem', 'issue', 'sampark', 'madad'],
    reply: 'For help:\n1. Use this chat to ask questions\n2. Go to Support > Submit Ticket for complex issues\n3. Call support: tap "Call Support" in Support page\n4. Email: use "Email Us" option\n\nAdmin will respond within 24 hours.',
    replyHi: 'सहायता के लिए:\n1. प्रश्न पूछने के लिए इस चैट का उपयोग करें\n2. जटिल मुद्दों के लिए सहायता > टिकट जमा करें\n3. कॉल करें: सहायता पेज में "कॉल करें" पर टैप करें\n\nएडमिन 24 घंटे में जवाब देगा।' },

  // Thank you
  { keywords: ['thank', 'thanks', 'ok', 'okay', 'got it', 'dhanyavad', 'shukriya'],
    reply: 'You\'re welcome! If you need more help, just ask. Have a great day! 😊',
    replyHi: 'आपका स्वागत है! अगर और मदद चाहिए तो बस पूछें। आपका दिन शुभ हो! 😊' },

  // UPI / Google Pay
  { keywords: ['upi', 'google pay', 'gpay', 'phonepe', 'paytm', 'bhim'],
    reply: 'To pay via UPI:\n1. Go to Payments > select month > Pay Now\n2. Click "Pay via UPI App"\n3. Your phone will show Google Pay/PhonePe/BHIM\n4. Select app, enter PIN, done!\n5. Enter UPI reference number to confirm\n\nYou can also scan QR code option.',
    replyHi: 'UPI से भुगतान:\n1. भुगतान > महीना चुनें > अभी भुगतान करें\n2. "UPI ऐप से भुगतान करें" पर क्लिक करें\n3. Google Pay/PhonePe/BHIM दिखेगा\n4. ऐप चुनें, PIN डालें, हो गया!\n5. पुष्टि के लिए UPI रेफरेंस नंबर दर्ज करें' },
];

export const getBotReply = (message: string, lang: 'en' | 'hi' = 'en'): string | null => {
  const lower = message.toLowerCase().trim();

  // Skip very short messages
  if (lower.length < 2) return null;

  // Find best matching rule
  let bestMatch: BotRule | null = null;
  let bestScore = 0;

  for (const rule of rules) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        score += kw.length; // longer keyword = better match
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  // Need at least one keyword match
  if (!bestMatch || bestScore === 0) return null;

  return lang === 'hi' && bestMatch.replyHi ? bestMatch.replyHi : bestMatch.reply;
};
