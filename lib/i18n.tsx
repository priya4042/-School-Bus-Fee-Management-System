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
    // Pages
    edit_profile: 'Edit Profile', password_reset: 'Password Reset',
    update_info: 'Update your personal information', change_password: 'Change your account password',
    choose_language: 'Choose your preferred language',
    family_hub: 'Family Hub', child_route_details: 'Child Route Details',
    only_routes_shown: 'Only routes assigned to your children are shown',
    no_child_routes: 'No child routes found', contact_admin: 'Contact bus admin to assign routes',
    route_name: 'Route Name', start: 'Start', end: 'End', plate: 'Plate',
    all_years: 'All Years', all_months: 'All Months', clear_all: 'Clear All',
    filter_year_month: 'Filter by Year & Month', overall_attendance: 'Overall Attendance Rate',
    no_records: 'No Records Found', no_attendance_data: 'No attendance data available',
    no_students: 'No Students Found', link_child: 'Contact admin to link your child',
    fee_ledger: 'Fee Ledger', payment_history: 'Payment History',
    total_cleared: 'Total Cleared', outstanding: 'Outstanding', overdue_months: 'Overdue Months',
    billing_period: 'Billing Period', student_name: 'Student Name', actions: 'Actions',
    pay_previous: 'Pay previous month first', future_scheduled: 'Future Scheduled',
    receipts: 'Receipts', digital_archive: 'Digital Receipt Archive',
    submit_a_ticket: 'Submit a Ticket', find_answers: 'Find answers to common questions',
    support_active: 'Support Active', open_ticket: 'Open Ticket', call_now: 'Call Now',
    send_email: 'Send Email', all_caught_up: 'All Caught Up',
    sign_out: 'Sign Out', confirm_sign_out: 'Are you sure you want to sign out?',

    // Login / Register / Forgot
    secure_sign_in: 'Secure Sign In', sign_in: 'Sign In', signing_in: 'Signing in...',
    email_or_phone: 'Email or Phone', enter_email_or_phone: 'Enter Email or Phone',
    enter_admission: 'Enter Admission Number', enter_password: 'Enter Password',
    legal_and_info: 'Legal & Info', more_information: 'More Information',
    about_us: 'About Us', services: 'Services', contact: 'Contact',
    refund: 'Refund', shipping: 'Shipping',
    incorrect_password: 'Incorrect password. If you have forgotten your password, please reset it.',
    login_failed: 'Login failed. Please check your credentials.',
    login_successful: 'Login successful',
    parent_short: 'Parent', admin_short: 'Admin',
    family_gateway: 'Secure Family Gateway', operations_hub: 'Global Operations Hub',
    bus_admin_terminal: 'Bus Admin Terminal',

    // Parent Dashboard
    family_hub_title: 'Family Hub', students_registered: 'Students Registered',
    consolidated_dues: 'Consolidated Dues',
    live_monitor: 'Live Monitor', establish_uplink: 'Establish Uplink',
    access_restricted: 'Access Restricted', tracking_not_enabled: 'Tracking access not enabled — contact Bus Administrator',
    encrypted_stream: 'Connect to encrypted satellite stream',
    bus_at_school: 'Bus at Campus • Final Stop', live_telemetry: 'Live Telemetry',
    set_boarding: 'Set Boarding', live_cam: 'Live Cam', disconnect: 'Disconnect',
    pay_now_short: 'Pay Now', wait_clear_prior: 'Wait: Clear Prior',
    no_dues_yet: 'No Dues Yet', no_dues_msg: 'No fee dues found yet for this child.',
    upcoming_dues: 'Upcoming Dues', dues_caught_up: 'All dues caught up',

    // Fees / FeeHistory
    fee_ledger_title: 'Fee Ledger', payment_history_subtitle: 'Comprehensive Payment History & Dues',
    spending_summary: 'Spending Summary', total_paid: 'Paid', avg_per_month: 'Avg / Month',
    paid_only: 'Paid only', already_absorbed: 'Already absorbed',
    months_label: 'Months', records_label: 'Records', streak_label: 'Streak',
    fee_due: 'Due', fees_due: 'Due',
    download_invoice: 'Download Invoice', view_receipt: 'View Receipt',
    receipt_preview: 'Receipt Preview',

    // Notifications page
    alert_center_title: 'Alert Center', system_notifications: 'System Notifications & Updates',
    mark_all: 'Mark All Read', filter_all: 'All', filter_unread: 'Unread',
    filter_payment: 'Payment', filter_bus: 'Bus', filter_alerts: 'Alerts',
    no_notifications_yet: 'No Notifications Yet',
    new_alerts_realtime: 'New alerts will land here in real time.',
    you_have_read_everything: 'You have read everything — nice work.',
    view_more: 'View', show_less: 'Show less',

    // Attendance
    daily_pickup_drop: 'Daily Pickup & Drop Records',
    calendar_view: 'Calendar', list_view: 'List',
    attendance_overview: 'Attendance Overview', attendance_calendar: 'Attendance Calendar',
    rate_label: 'Rate', no_record: 'No record',

    // Routes
    family_routes: 'Child Route Details', boarding_point_label: 'Boarding Point',
    not_set: 'Not Set', not_assigned: 'Not Assigned',

    // Generic actions
    add: 'Add', edit: 'Edit', delete: 'Delete', confirm: 'Confirm', remove: 'Remove',
    update: 'Update', refresh: 'Refresh', retry: 'Retry', open: 'Open',

    // Misc parent
    your_family: 'Your Family', viewing: 'Viewing', child: 'Child',
    pay_via_upi: 'Pay via UPI App', any_upi_app: 'Any other UPI app',
    upi_not_configured: 'UPI not configured by admin yet',
    fallback_warning: 'Using fallback ID — payments may not reach the correct account.',
    paying_to: 'Paying to', amount_to_pay: 'Amount to Pay',
    submitted_awaiting: 'Awaiting verification from admin',
    submit_payment: 'Submit Payment', submitting: 'Submitting...',
    utr_label: 'UTR / Transaction ID', screenshot_optional: 'Payment Screenshot (Optional)',
    upload_screenshot: 'Click to upload screenshot',
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
    // Pages
    edit_profile: 'प्रोफाइल संपादित करें', password_reset: 'पासवर्ड रीसेट',
    update_info: 'अपनी व्यक्तिगत जानकारी अपडेट करें', change_password: 'अपना पासवर्ड बदलें',
    choose_language: 'अपनी पसंदीदा भाषा चुनें',
    family_hub: 'परिवार हब', child_route_details: 'बच्चे के मार्ग विवरण',
    only_routes_shown: 'केवल आपके बच्चों के मार्ग दिखाए गए हैं',
    no_child_routes: 'कोई मार्ग नहीं मिला', contact_admin: 'मार्ग जोड़ने के लिए बस व्यवस्थापक से संपर्क करें',
    route_name: 'मार्ग का नाम', start: 'शुरू', end: 'अंत', plate: 'नंबर प्लेट',
    all_years: 'सभी वर्ष', all_months: 'सभी महीने', clear_all: 'सब साफ करें',
    filter_year_month: 'वर्ष और महीने से फ़िल्टर करें', overall_attendance: 'कुल उपस्थिति दर',
    no_records: 'कोई रिकॉर्ड नहीं', no_attendance_data: 'इस छात्र के लिए कोई उपस्थिति डेटा नहीं',
    no_students: 'कोई छात्र नहीं मिला', link_child: 'अपने बच्चे को जोड़ने के लिए व्यवस्थापक से संपर्क करें',
    fee_ledger: 'शुल्क खाता', payment_history: 'भुगतान इतिहास',
    total_cleared: 'कुल भुगतान', outstanding: 'बकाया', overdue_months: 'बकाया महीने',
    billing_period: 'बिलिंग अवधि', student_name: 'छात्र का नाम', actions: 'कार्रवाई',
    pay_previous: 'पहले पिछले महीने का भुगतान करें', future_scheduled: 'भविष्य निर्धारित',
    receipts: 'रसीदें', digital_archive: 'डिजिटल रसीद संग्रह',
    submit_a_ticket: 'टिकट जमा करें', find_answers: 'सामान्य प्रश्नों के उत्तर खोजें',
    support_active: 'सहायता सक्रिय', open_ticket: 'टिकट खोलें', call_now: 'अभी कॉल करें',
    send_email: 'ईमेल भेजें', all_caught_up: 'सब कुछ पढ़ लिया',
    sign_out: 'साइन आउट', confirm_sign_out: 'क्या आप साइन आउट करना चाहते हैं?',

    // Login / Register / Forgot
    secure_sign_in: 'सुरक्षित साइन इन', sign_in: 'साइन इन', signing_in: 'साइन इन हो रहा है...',
    email_or_phone: 'ईमेल या फ़ोन', enter_email_or_phone: 'ईमेल या फ़ोन दर्ज करें',
    enter_admission: 'प्रवेश संख्या दर्ज करें', enter_password: 'पासवर्ड दर्ज करें',
    legal_and_info: 'कानूनी और जानकारी', more_information: 'अधिक जानकारी',
    about_us: 'हमारे बारे में', services: 'सेवाएं', contact: 'संपर्क',
    refund: 'रिफंड', shipping: 'शिपिंग',
    incorrect_password: 'गलत पासवर्ड। यदि आप पासवर्ड भूल गए हैं, तो कृपया रीसेट करें।',
    login_failed: 'लॉगिन विफल। कृपया अपनी जानकारी जांचें।',
    login_successful: 'लॉगिन सफल',
    parent_short: 'अभिभावक', admin_short: 'एडमिन',
    family_gateway: 'सुरक्षित परिवार पोर्टल', operations_hub: 'ग्लोबल ऑपरेशन हब',
    bus_admin_terminal: 'बस एडमिन पोर्टल',

    // Parent Dashboard
    family_hub_title: 'परिवार हब', students_registered: 'पंजीकृत छात्र',
    consolidated_dues: 'कुल बकाया',
    live_monitor: 'लाइव मॉनिटर', establish_uplink: 'कनेक्शन शुरू करें',
    access_restricted: 'पहुंच प्रतिबंधित', tracking_not_enabled: 'ट्रैकिंग सक्रिय नहीं — बस एडमिन से संपर्क करें',
    encrypted_stream: 'एन्क्रिप्टेड सैटेलाइट स्ट्रीम से जुड़ें',
    bus_at_school: 'बस स्कूल पहुँच गई • अंतिम स्टॉप', live_telemetry: 'लाइव टेलीमेट्री',
    set_boarding: 'बोर्डिंग सेट करें', live_cam: 'लाइव कैम', disconnect: 'डिस्कनेक्ट',
    pay_now_short: 'अभी भुगतान', wait_clear_prior: 'प्रतीक्षा: पिछला साफ़ करें',
    no_dues_yet: 'अभी कोई बकाया नहीं', no_dues_msg: 'इस बच्चे के लिए अभी तक कोई शुल्क बकाया नहीं।',
    upcoming_dues: 'आगामी बकाया', dues_caught_up: 'सभी बकाया साफ़ हैं',

    // Fees / FeeHistory
    fee_ledger_title: 'शुल्क खाता', payment_history_subtitle: 'विस्तृत भुगतान इतिहास और बकाया',
    spending_summary: 'खर्च का सारांश', total_paid: 'भुगतान किया', avg_per_month: 'मासिक औसत',
    paid_only: 'केवल भुगतान', already_absorbed: 'पहले से शामिल',
    months_label: 'महीने', records_label: 'रिकॉर्ड', streak_label: 'लगातार',
    fee_due: 'बकाया', fees_due: 'बकाया',
    download_invoice: 'चालान डाउनलोड करें', view_receipt: 'रसीद देखें',
    receipt_preview: 'रसीद पूर्वावलोकन',

    // Notifications page
    alert_center_title: 'अलर्ट सेंटर', system_notifications: 'सिस्टम सूचनाएं और अपडेट',
    mark_all: 'सभी पढ़ा हुआ करें', filter_all: 'सभी', filter_unread: 'नई',
    filter_payment: 'भुगतान', filter_bus: 'बस', filter_alerts: 'अलर्ट',
    no_notifications_yet: 'अभी कोई सूचना नहीं',
    new_alerts_realtime: 'नई सूचनाएं तुरंत यहाँ दिखेंगी।',
    you_have_read_everything: 'सब कुछ पढ़ लिया — बढ़िया!',
    view_more: 'देखें', show_less: 'कम दिखाएं',

    // Attendance
    daily_pickup_drop: 'दैनिक पिकअप और ड्रॉप रिकॉर्ड',
    calendar_view: 'कैलेंडर', list_view: 'सूची',
    attendance_overview: 'उपस्थिति विवरण', attendance_calendar: 'उपस्थिति कैलेंडर',
    rate_label: 'दर', no_record: 'कोई रिकॉर्ड नहीं',

    // Routes
    family_routes: 'बच्चे के मार्ग विवरण', boarding_point_label: 'बोर्डिंग पॉइंट',
    not_set: 'सेट नहीं', not_assigned: 'असाइन नहीं',

    // Generic actions
    add: 'जोड़ें', edit: 'संपादित', delete: 'हटाएं', confirm: 'पुष्टि', remove: 'हटाएं',
    update: 'अपडेट', refresh: 'रीफ्रेश', retry: 'पुनः प्रयास', open: 'खोलें',

    // Misc parent
    your_family: 'आपका परिवार', viewing: 'देख रहे हैं', child: 'बच्चा',
    pay_via_upi: 'UPI ऐप से भुगतान', any_upi_app: 'कोई अन्य UPI ऐप',
    upi_not_configured: 'UPI अभी कॉन्फ़िगर नहीं',
    fallback_warning: 'फ़ॉलबैक ID प्रयोग में — भुगतान सही खाते में नहीं पहुँच सकता।',
    paying_to: 'भुगतान प्राप्तकर्ता', amount_to_pay: 'भुगतान राशि',
    submitted_awaiting: 'एडमिन की पुष्टि की प्रतीक्षा',
    submit_payment: 'भुगतान जमा करें', submitting: 'जमा हो रहा है...',
    utr_label: 'UTR / लेनदेन ID', screenshot_optional: 'भुगतान स्क्रीनशॉट (वैकल्पिक)',
    upload_screenshot: 'स्क्रीनशॉट अपलोड करें',
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
