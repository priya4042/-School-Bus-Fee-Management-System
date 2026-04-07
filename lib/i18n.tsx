import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Lang = 'en' | 'hi';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navigation
    dashboard: 'Dashboard', students: 'Students', attendance: 'Attendance', buses: 'Buses',
    live_tracking: 'Live Tracking', payments: 'Payments', notifications: 'Notifications',
    settings: 'Settings', support: 'Support', profile: 'Profile', logout: 'Logout',
    bus_admins: 'Bus Admins', documentation: 'Documentation',
    // Auth
    login: 'Login', register: 'Register', email: 'Email', password: 'Password',
    phone: 'Phone', submit: 'Submit', cancel: 'Cancel', save: 'Save',
    search: 'Search', loading: 'Loading',
    parent_terminal: 'Parent Terminal', admin_terminal: 'Bus Admin Terminal',
    admission_number: 'Admission Number', forgot_password: 'Forgot Password',
    new_user: 'New User?', register_account: 'Register Account',
    access_admin: 'Access Bus Admin Terminal', back_to_parent: 'Back to Parent Portal',
    // Fees
    fee_history: 'Fee History', pay_now: 'Pay Now', download_receipt: 'Download Receipt',
    pending: 'Pending', paid: 'Paid', overdue: 'Overdue', partial: 'Partial',
    total_due: 'Total Due', base_fee: 'Base Fee', late_fee: 'Late Fee',
    discount: 'Discount', amount: 'Amount', month: 'Month', year: 'Year',
    // Support
    support_center: 'Support Center', submit_ticket: 'Submit Ticket',
    call_support: 'Call Support', email_us: 'Email Us', faq: 'FAQ',
    chat_support: 'Chat Support', type_message: 'Type a message...',
    we_help: "We're here to help you 24/7", ticket_submitted: 'Ticket Submitted Successfully',
    respond_24h: 'Our team will respond within 24 hours.',
    // Student
    student_profile: 'Student Profile', attendance_history: 'Attendance History',
    routes: 'Routes', bus_camera: 'Bus Camera',
    // Language
    language: 'Language', english: 'English', hindi: 'Hindi', select_language: 'Select Language',
    // Status
    no_data: 'No Data Found', error: 'Error', success: 'Success', warning: 'Warning',
    active: 'Active', inactive: 'Inactive',
    // Dashboard
    school_bus_mgmt: 'School Bus Fee Management', realtime_tracking: 'Real-time Tracking',
    secure_payments: 'Secure Payments', total_students: 'Total Students',
    total_buses: 'Total Buses', active_routes: 'Active Routes',
    pending_fees: 'Pending Fees', monthly_revenue: 'Monthly Revenue',
    // Form fields
    full_name: 'Full Name', phone_number: 'Phone Number', grade: 'Grade',
    section: 'Section', boarding_point: 'Boarding Point', route: 'Route',
    bus_number: 'Bus Number', status: 'Status', date: 'Date',
    // Topbar
    mark_all_read: 'Mark All Read', alert_center: 'Alert Center', no_alerts: 'No Alerts',
    global_fleet: 'Global Fleet Link', online: 'Online',
    enterprise_fleet: 'Enterprise Fleet', main_portal: 'Main Portal',
    // Misc
    confirm_logout: 'Are you sure you want to logout?', yes: 'Yes', no: 'No',
    subject: 'Subject', priority: 'Priority', description: 'Description',
    send: 'Send', close: 'Close', back: 'Back', next: 'Next',
    view_all: 'View All', filter: 'Filter', clear: 'Clear',
    today: 'Today', yesterday: 'Yesterday', this_month: 'This Month',
    pickup: 'Pickup', drop: 'Drop', present: 'Present', absent: 'Absent',
    user_manual: 'User Manual', safety_policy: 'Safety Policy',
    terms_of_service: 'Terms of Service', privacy_policy: 'Privacy Policy',
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड', students: 'छात्र', attendance: 'उपस्थिति', buses: 'बसें',
    live_tracking: 'लाइव ट्रैकिंग', payments: 'भुगतान', notifications: 'सूचनाएं',
    settings: 'सेटिंग्स', support: 'सहायता', profile: 'प्रोफाइल', logout: 'लॉगआउट',
    bus_admins: 'बस एडमिन', documentation: 'दस्तावेज़',
    // Auth
    login: 'लॉगिन', register: 'रजिस्टर', email: 'ईमेल', password: 'पासवर्ड',
    phone: 'फ़ोन', submit: 'जमा करें', cancel: 'रद्द करें', save: 'सहेजें',
    search: 'खोजें', loading: 'लोड हो रहा है',
    parent_terminal: 'अभिभावक पोर्टल', admin_terminal: 'बस एडमिन पोर्टल',
    admission_number: 'प्रवेश संख्या', forgot_password: 'पासवर्ड भूल गए?',
    new_user: 'नए उपयोगकर्ता?', register_account: 'खाता बनाएं',
    access_admin: 'बस एडमिन पोर्टल खोलें', back_to_parent: 'अभिभावक पोर्टल पर वापस',
    // Fees
    fee_history: 'शुल्क इतिहास', pay_now: 'अभी भुगतान करें', download_receipt: 'रसीद डाउनलोड करें',
    pending: 'लंबित', paid: 'भुगतान किया', overdue: 'बकाया', partial: 'आंशिक',
    total_due: 'कुल देय', base_fee: 'मूल शुल्क', late_fee: 'विलंब शुल्क',
    discount: 'छूट', amount: 'राशि', month: 'महीना', year: 'वर्ष',
    // Support
    support_center: 'सहायता केंद्र', submit_ticket: 'टिकट जमा करें',
    call_support: 'कॉल करें', email_us: 'ईमेल करें', faq: 'सामान्य प्रश्न',
    chat_support: 'चैट सहायता', type_message: 'संदेश लिखें...',
    we_help: 'हम आपकी 24/7 मदद के लिए यहाँ हैं', ticket_submitted: 'टिकट सफलतापूर्वक जमा हुआ',
    respond_24h: 'हमारी टीम 24 घंटे में जवाब देगी।',
    // Student
    student_profile: 'छात्र प्रोफाइल', attendance_history: 'उपस्थिति इतिहास',
    routes: 'मार्ग', bus_camera: 'बस कैमरा',
    // Language
    language: 'भाषा', english: 'अंग्रेज़ी', hindi: 'हिन्दी', select_language: 'भाषा चुनें',
    // Status
    no_data: 'कोई डेटा नहीं मिला', error: 'त्रुटि', success: 'सफल', warning: 'चेतावनी',
    active: 'सक्रिय', inactive: 'निष्क्रिय',
    // Dashboard
    school_bus_mgmt: 'स्कूल बस शुल्क प्रबंधन', realtime_tracking: 'रियल-टाइम ट्रैकिंग',
    secure_payments: 'सुरक्षित भुगतान', total_students: 'कुल छात्र',
    total_buses: 'कुल बसें', active_routes: 'सक्रिय मार्ग',
    pending_fees: 'लंबित शुल्क', monthly_revenue: 'मासिक राजस्व',
    // Form fields
    full_name: 'पूरा नाम', phone_number: 'फ़ोन नंबर', grade: 'कक्षा',
    section: 'सेक्शन', boarding_point: 'बोर्डिंग पॉइंट', route: 'मार्ग',
    bus_number: 'बस नंबर', status: 'स्थिति', date: 'तारीख',
    // Topbar
    mark_all_read: 'सभी पढ़ा हुआ करें', alert_center: 'अलर्ट सेंटर', no_alerts: 'कोई अलर्ट नहीं',
    global_fleet: 'ग्लोबल फ्लीट लिंक', online: 'ऑनलाइन',
    enterprise_fleet: 'एंटरप्राइज फ्लीट', main_portal: 'मुख्य पोर्टल',
    // Misc
    confirm_logout: 'क्या आप लॉगआउट करना चाहते हैं?', yes: 'हाँ', no: 'नहीं',
    subject: 'विषय', priority: 'प्राथमिकता', description: 'विवरण',
    send: 'भेजें', close: 'बंद करें', back: 'पीछे', next: 'आगे',
    view_all: 'सभी देखें', filter: 'फ़िल्टर', clear: 'साफ करें',
    today: 'आज', yesterday: 'कल', this_month: 'इस महीने',
    pickup: 'पिकअप', drop: 'ड्रॉप', present: 'उपस्थित', absent: 'अनुपस्थित',
    user_manual: 'उपयोगकर्ता पुस्तिका', safety_policy: 'सुरक्षा नीति',
    terms_of_service: 'सेवा की शर्तें', privacy_policy: 'गोपनीयता नीति',
  },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'hi' ? 'hi' : 'en') as Lang;
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('app_language', newLang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: string): string => {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
