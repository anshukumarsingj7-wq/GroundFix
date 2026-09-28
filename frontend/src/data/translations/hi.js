/**
 * GroundFix Hindi Translations (hi)
 * हिन्दी अनुवाद
 */
export default {
  // Brand
  brandName: 'GroundFix',
  brandTagline: 'Report. Fix. Safer Roads.',
  platformSubtitle: 'स्मार्ट सड़क सुरक्षा प्लेटफ़ॉर्म',
  heroDescription: 'GroundFix नागरिकों द्वारा दर्ज किए गए सड़क खतरों को अधिकारियों और चालकों के लिए कार्रवाई योग्य सुरक्षा जानकारी में बदलता है।',

  // Navigation
  nav: {
    home: 'होम',
    report: 'खतरा दर्ज करें',
    track: 'शिकायत ट्रैक करें',
    map: 'सुरक्षा मानचित्र',
    driver: 'ड्राइवर मोड',
    roads: 'सड़क स्वास्थ्य',
    officer: 'अधिकारी डैशबोर्ड'
  },

  // Actions & Buttons
  common: {
    reportHazard: 'खतरा दर्ज करें',
    trackComplaint: 'शिकायत ट्रैक करें',
    safetyMap: 'सड़क सुरक्षा मानचित्र',
    driverMode: 'ड्राइवर मोड',
    officerDashboard: 'अधिकारी डैशबोर्ड',
    submit: 'सबमिट करें',
    submitting: 'सबमिट हो रहा है...',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    all: 'सभी',
    loading: 'डेटा लोड हो रहा है...',
    error: 'एक त्रुटि हुई',
    retry: 'पुनः प्रयास करें',
    viewDetails: 'विवरण देखें',
    openInNav: 'नेविगेशन में खोलें',
    copyId: 'आईडी कॉपी करें',
    copied: 'कॉपी हो गया!',
    backToHome: 'होम पर वापस जाएं',
    language: 'भाषा',
    theme: 'थीम',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    demoNotice: 'डेमो मोड सक्रिय'
  },

  // Process Steps
  process: {
    title: 'ग्राउंडफिक्स कैसे काम करता है',
    subtitle: 'नागरिक की रिपोर्ट से लेकर सड़क की पक्की मरम्मत तक',
    step1Title: 'नागरिक रिपोर्ट',
    step1Desc: 'नागरिक जीपीएस और गंभीरता के साथ गड्ढे की फोटो खींचकर रिपोर्ट करता है।',
    step2Title: 'सत्यापन',
    step2Desc: 'छवि प्रामाणिकता जांच फर्जी रिपोर्ट रोकती है और डुप्लीकेट गड्ढों की पहचान करती है।',
    step3Title: 'जोखिम विश्लेषण',
    step3Desc: 'नागरिकों की पुष्टि और दुर्घटनाओं के आधार पर 0-100 का डायनामिक रिस्क स्कोर।',
    step4Title: 'अधिकारी कार्रवाई',
    step4Desc: 'उच्च जोखिम वाले खतरे तुरंत स्मार्ट प्राथमिकता कतार में भेजे जाते हैं।',
    step5Title: 'मरम्मत',
    step5Desc: 'अधिकारी दल गड्ढों को ठीक कर काम से पहले और बाद के फोटो अपलोड करते हैं।',
    step6Title: 'सुरक्षित सड़कें',
    step6Desc: 'नागरिक काम की पुष्टि करते हैं जिससे सड़कें हमेशा सुरक्षित रहें।'
  },

  // Home Page
  home: {
    liveSafetyIndex: 'सड़क सुरक्षा स्थिति',
    statReports: 'कुल रिपोर्ट',
    statResolved: 'सुलझाई गई समस्याएं',
    statActiveAlerts: 'सक्रिय गंभीर खतरे',
    statDriversProtected: 'चेतावनी प्राप्त चालक',
    ctaTitle: 'सड़क पर कोई खतरनाक गड्ढा देखा?',
    ctaSubtitle: 'हजारों यात्रियों को दुर्घटना से बचाएं। 30 सेकंड में रिपोर्ट दर्ज करें।',
    reportNow: 'अभी सड़क खतरा दर्ज करें',
    trackExisting: 'पुरानी शिकायत ट्रैक करें'
  },

  // Citizen Reporting Form (/report)
  report: {
    title: 'सड़क खतरे की रिपोर्ट करें',
    subtitle: 'अधिकारियों और वाहन चालकों को सतर्क करने के लिए फोटो और स्थान साझा करें।',
    photoUploadTitle: '1. खतरे की तस्वीर',
    photoUploadDesc: 'गड्ढे या सड़क खराबी की स्पष्ट तस्वीर लें। मान्य: JPEG, PNG, WebP।',
    uploadButton: 'फोटो चुनें / कैमरा से खींचें',
    photoAuthenticity: 'प्रामाणिकता विश्वसनीयता',
    authLikely: 'संभवतः प्रामाणिक',
    authSuspicious: 'संदेहास्पद',
    authAi: 'संभवतः AI निर्मित',
    authReview: 'मैन्युअल समीक्षा',
    authRejected: 'अस्वीकृत',
    locationTitle: '2. स्थान और सड़क',
    useMyLocation: '📍 मेरा स्थान उपयोग करें',
    selectOnMap: '🗺 मानचित्र पर स्थान चुनें',
    locating: 'जीपीएस स्थान प्राप्त किया जा रहा है...',
    locationCaptured: 'स्थान सफलतापूर्वक प्राप्त हुआ',
    roadNameLabel: 'सड़क का नाम / लैंडमार्क',
    roadNamePlaceholder: 'उदा. एमजी रोड, बस स्टैंड के पास',
    hazardTypeTitle: '3. खतरे का प्रकार',
    hazardTypes: {
      pothole: 'सड़क का गड्ढा (पॉथोल)',
      damaged_road: 'टूटी सड़क / दरारें',
      open_manhole: 'खुला मैनहोल / नाला',
      road_obstruction: 'सड़क पर रुकावट / मलबा',
      broken_infrastructure: 'टूटा हुआ डिवाइडर या पोल',
      other: 'अन्य सड़क खतरा'
    },
    descriptionTitle: '4. विवरण',
    descriptionPlaceholder: 'गड्ढे की गहराई, लेन की रुकावट या सड़क की स्थिति का विवरण लिखें...',
    voiceButton: '🎙 बोलकर रिपोर्ट करें',
    voiceListening: 'सुन रहे हैं... कृपया बोलें',
    voiceUnsupported: 'इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया टाइप करें।',
    severityTitle: '5. खतरे की गंभीरता',
    severityLevels: {
      Low: 'कम — हल्की सतह खराबी',
      Medium: 'मध्यम — स्पष्ट गड्ढा, वाहन धीमे होते हैं',
      High: 'उच्च — गहरा गड्ढा, अचानक मुड़ना पड़ता है',
      Critical: 'गंभीर — अत्यंत खतरनाक, टायर फटने या दुर्घटना का तुरंत खतरा'
    },
    nearMissTitle: '6. दुर्घटना या बाल-बाल बचना (Near Miss)',
    nearMissQuestion: 'क्या इस खतरे से कोई खतरनाक स्थिति पैदा हुई?',
    nearMissOptions: {
      none: 'कोई नहीं',
      fell: 'लगभग गिर गए',
      crashed: 'लगभग टकरा गए',
      damaged: 'वाहन क्षतिग्रस्त हुआ',
      pedestrian: 'पैदल चलने वालों के लिए मुश्किल',
      accessibility: 'दिव्यांगों के लिए बाधा',
      traffic: 'यातायात जाम की समस्या'
    },
    nearMissDetailsLabel: 'क्या हुआ था संक्षेप में बताएं (वैकल्पिक)',
    nearMissDetailsPlaceholder: 'घटना या नुकसान का संक्षिप्त विवरण...',
    submitReport: 'खतरे की रिपोर्ट सबमिट करें',
    duplicateWarningTitle: 'पास में ही ऐसा खतरा पहले से रिपोर्ट है।',
    duplicateWarningDesc: 'आपके द्वारा चुने गए स्थान से 100 मीटर के भीतर पहले से शिकायत दर्ज है।',
    confirmExistingBtn: '👥 पुरानी रिपोर्ट की पुष्टि करें',
    submitNewBtn: 'फिर भी नई रिपोर्ट दर्ज करें',
    successTitle: 'शिकायत सफलतापूर्वक दर्ज हुई',
    successSubtitle: 'आपकी रिपोर्ट नगर निगम और सुरक्षा विभाग को भेज दी गई है।',
    complaintIdLabel: 'शिकायत आईडी (Complaint ID)',
    saveIdAdvice: 'अपनी शिकायत ट्रैक करने के लिए इस आईडी को सहेज कर रखें।',
    trackComplaintBtn: 'शिकायत अभी ट्रैक करें',
    reportAnotherBtn: 'दूसरा खतरा दर्ज करें'
  },

  // Complaint Tracking (/track)
  track: {
    title: 'शिकायत ट्रैक करें',
    subtitle: 'स्थिति, नागरिकों की पुष्टि, अधिकारी प्रगति और मरम्मत के फोटो देखें।',
    searchPlaceholder: 'शिकायत आईडी दर्ज करें (उदा. POT-1001)',
    searchBtn: 'ट्रैक करें',
    quickSearchTitle: 'या हालिया रिपोर्ट देखें:',
    statusHeading: 'शिकायत की स्थिति',
    statuses: {
      Reported: 'दर्ज (Reported)',
      Verified: 'सत्यापित (Verified)',
      Assigned: 'विभाग को सौंपा (Assigned)',
      InProgress: 'कार्य प्रगति पर (In Progress)',
      Resolved: 'सुलझ गई (Resolved)',
      Reopened: 'पुनः खोली गई (Reopened)',
      Rejected: 'अस्वीकृत (Rejected)'
    },
    riskScoreLabel: 'जोखिम स्कोर',
    riskExplanation: 'जोखिम मूल्यांकन',
    confirmationsLabel: 'नागरिकों की पुष्टि',
    nearMissLabel: 'दुर्घटना रिपोर्ट',
    confirmButton: '👥 मैं भी यह समस्या देखता हूं',
    confirmedSuccess: 'धन्यवाद! आपकी पुष्टि से इस गड्ढे की प्राथमिकता बढ़ गई है।',
    alreadyConfirmed: 'आप इस ब्राउज़र से पहले ही पुष्टि कर चुके हैं।',
    addNearMissBtn: '⚠️ दुर्घटना / बाल-बाल बचने की रिपोर्ट जोड़ें',
    addNearMissModalTitle: 'इस खतरे से हुई घटना दर्ज करें',
    historyTitle: 'प्रगति समय-रेखा (Timeline)',
    beforeAfterTitle: 'मरम्मत से पहले और बाद का प्रमाण',
    beforeLabel: 'मरम्मत से पहले',
    afterLabel: 'मरम्मत के बाद',
    noProofYet: 'काम प्रगति पर है। पूरा होने पर फोटो अपलोड किए जाएंगे।',
    reverificationTitle: 'क्या यह समस्या वास्तव में ठीक हो गई है?',
    reverificationDesc: 'आपका सत्यापन यह सुनिश्चित करता है कि मरम्मत टिकाऊ और सही हुई है।',
    yesFixed: '✅ हाँ, ठीक हो गया',
    noStillExists: '❌ नहीं, अभी भी मौजूद है (पुनः खोलें)',
    reopenedSuccess: 'शिकायत दोबारा खोली गई। अधिकारियों को सूचित किया गया।',
    verifiedSuccess: 'पुष्टि के लिए धन्यवाद! समाधान सत्यापित हुआ।'
  },

  // Officer Dashboard (/officer)
  officer: {
    title: 'सड़क सुरक्षा अधिकारी डैशबोर्ड',
    subtitle: 'प्राथमिकता कतार, विभाग आवंटन और मरम्मत सत्यापन।',
    stats: {
      total: 'कुल शिकायतें',
      critical: 'अत्यंत गंभीर',
      high: 'उच्च जोखिम',
      pending: 'लंबित समीक्षा',
      inProgress: 'प्रगति में',
      resolved: 'सुलझाई गई',
      reopened: 'नागरिकों द्वारा पुनः खोली गई'
    },
    priorityQueueTitle: 'स्मार्ट प्राथमिकता कार्य कतार',
    fixFirst: '🔴 पहले ठीक करें (FIX FIRST) — गंभीर सुरक्षा खतरे',
    fixNext: '🟠 अगला ठीक करें (FIX NEXT) — उच्च जोखिम',
    normalPriority: '🟡 सामान्य प्राथमिकता (NORMAL)',
    tableTitle: 'सक्रिय सड़क शिकायतें',
    tableHeaders: {
      id: 'शिकायत आईडी',
      location: 'स्थान / सड़क',
      severity: 'गंभीरता',
      riskScore: 'रिस्क स्कोर',
      confirmations: 'पुष्टि',
      nearMisses: 'दुर्घटनाएं',
      status: 'स्थिति',
      actions: 'कार्रवाई'
    },
    filters: {
      status: 'स्थिति अनुसार फ़िल्टर',
      severity: 'गंभीरता अनुसार',
      risk: 'जोखिम अनुसार',
      road: 'सड़क अनुसार'
    },
    actions: {
      manage: 'प्रबंधन करें',
      verify: 'रिपोर्ट सत्यापित करें',
      reject: 'अस्वीकार करें',
      assignDept: 'विभाग सौंपें',
      changeStatus: 'स्थिति बदलें',
      addNotes: 'अधिकारी के नोट्स',
      uploadBefore: 'पहले का फोटो अपलोड करें',
      uploadAfter: 'बाद का फोटो अपलोड करें (समाधान हेतु आवश्यक)',
      markResolved: 'समाधान चिह्नित करें',
      saveChanges: 'कार्रवाई सहेजें',
      selectDept: 'विभाग का चयन करें',
      notesPlaceholder: 'निरीक्षण नोट या मरम्मत दल का विवरण लिखें...'
    }
  },

  // Road Safety Map (/map)
  map: {
    title: 'सड़क सुरक्षा खतरा मानचित्र',
    subtitle: 'सड़क की कमियों और गड्ढों का लाइव इंटरेक्टिव नक्शा।',
    filters: 'मानचित्र फ़िल्टर',
    allSeverities: 'सभी गंभीरता स्तर',
    allStatuses: 'सभी स्थितियां',
    activeOnly: 'केवल सक्रिय खतरे',
    legendTitle: 'खतरे का स्तर',
    legendCritical: 'गंभीर (81–100)',
    legendHigh: 'उच्च (61–80)',
    legendMedium: 'मध्यम (31–60)',
    legendLow: 'कम (0–30)',
    legendResolved: 'ठीक हो चुका',
    popupId: 'शिकायत',
    popupRoad: 'सड़क',
    popupRisk: 'रिस्क स्कोर',
    popupConfirmations: 'पुष्टि',
    popupNearMiss: 'दुर्घटनाएं',
    popupTrackLink: 'शिकायत विवरण देखें →'
  },

  // Driver Mode (/driver)
  driver: {
    title: 'ड्राइवर मोड को-पायलट',
    subtitle: 'यात्रा के दौरान आगे आने वाले गड्ढों की रीयल-टाइम सूचना।',
    enableGpsTitle: 'ड्राइवर मोड हेतु लोकेशन चालू करें',
    enableGpsDesc: 'GroundFix आगे आने वाले गड्ढों की दूरी वास्तविक समय में मापता है।',
    enableGpsBtn: 'GPS को-पायलट चालू करें',
    simulatingTitle: 'सिम्युलेटेड ड्राइविंग रूट (डेमो मोड)',
    simulationDesc: 'कमरे में बैठकर भी लाइव अलर्ट देखने के लिए डेमो रूट चालू करें।',
    startSim: 'डेमो रूट शुरू करें',
    stopSim: 'डेमो रोकें',
    currentLocation: 'वर्तमान स्थिति',
    drivingSpeed: 'वर्तमान गति',
    upcomingHazards: 'आगे आने वाले सड़क खतरे',
    noNearbyHazards: 'वर्तमान मार्ग पर कोई नजदीकी खतरा नहीं है। सुरक्षित यात्रा करें!',
    warningPrefixPothole: '⚠️ आगे गड्ढा है',
    warningPrefixHighRisk: '🚨 आगे गंभीर खतरा है',
    warningPrefixCaution: '⚠️ सड़क सावधानी',
    distanceAhead: 'आगे',
    soundToggle: 'ध्वनि चेतावनी',
    soundOn: 'ध्वनि अलर्ट चालू',
    soundOff: 'ध्वनि अलर्ट बंद',
    openGoogleMaps: 'नेविगेशन में खोलें',
    riskLabel: 'रिस्क स्कोर',
    confirmationsLabel: 'पुष्टि',
    nearMissesLabel: 'दुर्घटनाएं'
  },

  // Road Health (/roads)
  roads: {
    title: 'सड़क स्वास्थ्य विश्लेषण',
    subtitle: 'सड़कों की सुरक्षा स्थिति और नगर निगम सुधार योजना।',
    healthIndex: 'सड़क स्वास्थ्य सूचकांक',
    goodHealth: 'अच्छा स्वास्थ्य',
    moderateRisk: 'मध्यम जोखिम',
    highRisk: 'उच्च जोखिम',
    criticalRisk: 'गंभीर जोखिम',
    hazardsCount: 'कुल खतरे',
    unresolvedCount: 'लंबित',
    reopenedCount: 'पुनः खोली गई',
    nearMissCount: 'दुर्घटनाएं',
    viewHazards: 'मानचित्र पर देखें'
  },

  // AI Assistant
  assistant: {
    title: 'ग्राउंडफिक्स सहायक',
    subtitle: 'सड़क सुरक्षा और प्लेटफ़ॉर्म से जुड़े प्रश्न पूछें',
    greeting: 'नमस्ते! मैं आपका ग्राउंडफिक्स सहायक हूं। मैं आज आपकी क्या मदद कर सकता हूं?',
    placeholder: 'कोई प्रश्न पूछें (जैसे गड्ढे की रिपोर्ट कैसे करें?)...',
    send: 'भेजें',
    quickQuestionsTitle: 'सामान्य प्रश्न:',
    chipReport: 'गड्ढे की रिपोर्ट कैसे करें?',
    chipTrack: 'शिकायत कैसे ट्रैक करें?',
    chipRisk: 'रिस्क स्कोर का क्या मतलब है?',
    chipDriver: 'ड्राइवर मोड क्या है?',
    chipAuth: 'फोटो प्रामाणिकता जांच कैसे काम करती है?',
    chipNearMiss: 'नियर मिस रिपोर्टिंग क्या है?'
  }
};
