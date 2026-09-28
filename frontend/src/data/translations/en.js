/**
 * GroundFix English Translations (en)
 * Primary fallback language
 */
export default {
  // Brand
  brandName: 'GroundFix',
  brandTagline: 'Report. Fix. Safer Roads.',
  platformSubtitle: 'Smart Road Safety Platform',
  heroDescription: 'GroundFix turns citizen road-hazard reports into actionable road-safety intelligence for authorities and drivers.',

  // Navigation
  nav: {
    home: 'Home',
    report: 'Report Hazard',
    track: 'Track Complaint',
    map: 'Safety Map',
    driver: 'Driver Mode',
    roads: 'Road Health',
    officer: 'Officer Dashboard'
  },

  // Actions & Buttons
  common: {
    reportHazard: 'Report a Hazard',
    trackComplaint: 'Track Complaint',
    safetyMap: 'Road Safety Map',
    driverMode: 'Driver Mode',
    officerDashboard: 'Officer Dashboard',
    submit: 'Submit',
    submitting: 'Submitting...',
    cancel: 'Cancel',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    loading: 'Loading data...',
    error: 'An error occurred',
    retry: 'Retry',
    viewDetails: 'View Details',
    openInNav: 'Open in Navigation',
    copyId: 'Copy ID',
    copied: 'Copied!',
    backToHome: 'Back to Home',
    language: 'Language',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    demoNotice: 'Demo Hackathon Mode Active'
  },

  // Process Steps (Home)
  process: {
    title: 'How GroundFix Works',
    subtitle: 'From citizen alert to verified municipal asphalt repair',
    step1Title: 'Citizen Report',
    step1Desc: 'Citizen snaps a photo with GPS and tags severity and near-misses.',
    step2Title: 'Verification',
    step2Desc: 'Image authenticity checks prevent fraud, duplicate detection alerts nearby hazards.',
    step3Title: 'Risk Analysis',
    step3Desc: 'Dynamic 0–100 scoring based on crowd confirmations and vehicle damage incidents.',
    step4Title: 'Officer Action',
    step4Desc: 'High-risk hazards enter the Smart Priority Queue for rapid department dispatch.',
    step5Title: 'Repair',
    step5Desc: 'Field teams repair potholes and upload Before & After proof photos.',
    step6Title: 'Safer Roads',
    step6Desc: 'Citizens re-verify completion, updating driver warnings and road health.'
  },

  // Home Page Stats & Features
  home: {
    liveSafetyIndex: 'Live Safety Intelligence',
    statReports: 'Total Reports',
    statResolved: 'Hazards Resolved',
    statActiveAlerts: 'Active High-Risk Alerts',
    statDriversProtected: 'Drivers Warned',
    ctaTitle: 'Spotted a dangerous pothole or road hazard?',
    ctaSubtitle: 'Help thousands of daily commuters avoid accidents. Report it in 30 seconds.',
    reportNow: 'Report Road Hazard Now',
    trackExisting: 'Track an Existing Complaint'
  },

  // Citizen Reporting Form (/report)
  report: {
    title: 'Report a Road Hazard',
    subtitle: 'Provide photo, location, and hazard details to alert authorities and drivers.',
    photoUploadTitle: '1. Hazard Photograph',
    photoUploadDesc: 'Take a clear photo of the pothole or road defect. Supported: JPEG, PNG, WebP.',
    uploadButton: 'Choose Photo / Take Picture',
    photoAuthenticity: 'Authenticity Confidence',
    authLikely: 'Likely Authentic',
    authSuspicious: 'Suspicious',
    authAi: 'Potentially AI Generated',
    authReview: 'Manual Review',
    authRejected: 'Rejected',
    locationTitle: '2. Location & Road',
    useMyLocation: '📍 Use My Location',
    selectOnMap: '🗺 Select Location on Map',
    locating: 'Acquiring GPS coordinates...',
    locationCaptured: 'Location captured successfully',
    roadNameLabel: 'Road Name / Landmark',
    roadNamePlaceholder: 'e.g. MG Road near Trinity Junction',
    hazardTypeTitle: '3. Hazard Type',
    hazardTypes: {
      pothole: 'Pothole',
      damaged_road: 'Damaged Road / Surface Crack',
      open_manhole: 'Open Manhole / Storm Drain',
      road_obstruction: 'Road Obstruction / Debris',
      broken_infrastructure: 'Broken Street Infrastructure',
      other: 'Other Road Hazard'
    },
    descriptionTitle: '4. Description',
    descriptionPlaceholder: 'Describe the depth, lane obstruction, or road condition...',
    voiceButton: '🎙 Report by Voice',
    voiceListening: 'Listening... Please speak now',
    voiceUnsupported: 'Voice input is not supported in this browser. Please type your report.',
    severityTitle: '5. Hazard Severity',
    severityLevels: {
      Low: 'Low — Shallow surface wear, minor bump',
      Medium: 'Medium — Noticeable hole, vehicles slow down',
      High: 'High — Deep crater, causes sudden swerving',
      Critical: 'Critical — Severe danger, open drain, immediate tire damage risk'
    },
    nearMissTitle: '6. Near Miss Reporting',
    nearMissQuestion: 'Did this hazard create a dangerous situation?',
    nearMissOptions: {
      none: 'None',
      fell: 'Almost fell',
      crashed: 'Almost crashed',
      damaged: 'Vehicle damaged',
      pedestrian: 'Difficult for pedestrians',
      accessibility: 'Accessibility issue',
      traffic: 'Traffic obstruction'
    },
    nearMissDetailsLabel: 'Tell us what happened (optional)',
    nearMissDetailsPlaceholder: 'Describe the close call or damage in brief...',
    submitReport: 'Submit Hazard Report',
    duplicateWarningTitle: 'A similar road hazard has already been reported nearby.',
    duplicateWarningDesc: 'A hazard was already reported within 100 meters of your selected spot.',
    confirmExistingBtn: '👥 Confirm Existing Report',
    submitNewBtn: 'Submit New Report Anyway',
    successTitle: 'Report Submitted Successfully',
    successSubtitle: 'Your report has been entered into the municipal road safety pipeline.',
    complaintIdLabel: 'Complaint ID',
    saveIdAdvice: 'Save this ID to track your complaint.',
    trackComplaintBtn: 'Track This Complaint Now',
    reportAnotherBtn: 'Report Another Hazard'
  },

  // Complaint Tracking (/track)
  track: {
    title: 'Track Complaint',
    subtitle: 'Track live status, community confirmations, officer actions, and repair proofs.',
    searchPlaceholder: 'Enter Complaint ID (e.g. POT-1001)',
    searchBtn: 'Track',
    quickSearchTitle: 'Or view recent demo reports:',
    statusHeading: 'Complaint Status',
    statuses: {
      Reported: 'Reported',
      Verified: 'Verified',
      Assigned: 'Assigned',
      InProgress: 'In Progress',
      Resolved: 'Resolved',
      Reopened: 'Reopened',
      Rejected: 'Rejected'
    },
    riskScoreLabel: 'Risk Score',
    riskExplanation: 'Risk Assessment',
    confirmationsLabel: 'Community Confirmations',
    nearMissLabel: 'Reported Near Misses',
    confirmButton: '👥 I also see this problem',
    confirmedSuccess: 'Thank you! Your confirmation increases the hazard risk priority.',
    alreadyConfirmed: 'You have already confirmed this hazard from this browser.',
    addNearMissBtn: '⚠️ Report a Near Miss Incident',
    addNearMissModalTitle: 'Report a Near Miss on this hazard',
    historyTitle: 'Status Progression Timeline',
    beforeAfterTitle: 'Before & After Repair Proof',
    beforeLabel: 'BEFORE REPAIR',
    afterLabel: 'AFTER REPAIR',
    noProofYet: 'Repair in progress. Proof photos will be uploaded upon completion.',
    reverificationTitle: 'Has this issue actually been fixed?',
    reverificationDesc: 'Your community verification ensures road repairs are durable and genuine.',
    yesFixed: '✅ Yes, Fixed',
    noStillExists: '❌ No, Still Exists (Reopen)',
    reopenedSuccess: 'Complaint reopened. Field authorities notified of recurring hazard.',
    verifiedSuccess: 'Thank you! Resolution confirmed.'
  },

  // Officer Dashboard (/officer)
  officer: {
    title: 'Officer Road Safety Dashboard',
    subtitle: 'Municipal dispatch, smart hazard prioritization, and repair verification.',
    stats: {
      total: 'Total Reports',
      critical: 'Critical Risk',
      high: 'High Risk',
      pending: 'Pending Review',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      reopened: 'Reopened by Citizens'
    },
    priorityQueueTitle: 'Smart Priority Dispatch Queue',
    fixFirst: '🔴 FIX FIRST — Critical Safety Hazards',
    fixNext: '🟠 FIX NEXT — High Risk Road Hazards',
    normalPriority: '🟡 NORMAL PRIORITY',
    tableTitle: 'Active Road Complaints',
    tableHeaders: {
      id: 'Complaint ID',
      location: 'Location / Road',
      severity: 'Severity',
      riskScore: 'Risk Score',
      confirmations: 'Confirmations',
      nearMisses: 'Near Misses',
      status: 'Status',
      actions: 'Action'
    },
    filters: {
      status: 'Filter by Status',
      severity: 'Filter by Severity',
      risk: 'Filter by Risk',
      road: 'Filter by Road'
    },
    actions: {
      manage: 'Manage',
      verify: 'Verify Report',
      reject: 'Reject Report',
      assignDept: 'Assign Department',
      changeStatus: 'Change Status',
      addNotes: 'Officer Field Notes',
      uploadBefore: 'Upload Before Proof',
      uploadAfter: 'Upload After Proof (Required to Resolve)',
      markResolved: 'Mark as Resolved',
      saveChanges: 'Save Officer Action',
      selectDept: 'Select Municipal Department',
      notesPlaceholder: 'Add official inspection notes, crew dispatch details, or road condition updates...'
    }
  },

  // Road Safety Map (/map)
  map: {
    title: 'Road Safety Hazard Map',
    subtitle: 'Interactive geospatial intelligence on road defects and cluster density.',
    filters: 'Map Filters',
    allSeverities: 'All Severities',
    allStatuses: 'All Statuses',
    activeOnly: 'Active Hazards Only',
    legendTitle: 'Hazard Risk Tiers',
    legendCritical: 'Critical (81–100)',
    legendHigh: 'High (61–80)',
    legendMedium: 'Medium (31–60)',
    legendLow: 'Low (0–30)',
    legendResolved: 'Resolved / Fixed',
    popupId: 'Complaint',
    popupRoad: 'Road',
    popupRisk: 'Risk Score',
    popupConfirmations: 'Confirmations',
    popupNearMiss: 'Near Misses',
    popupTrackLink: 'Track Full Complaint →'
  },

  // Driver Mode (/driver)
  driver: {
    title: 'Driver Mode Co-Pilot',
    subtitle: 'Real-time road hazard intelligence and proximity alerts as you travel.',
    enableGpsTitle: 'Enable Location to use Driver Mode',
    enableGpsDesc: 'GroundFix computes distance to upcoming potholes and hazards in real time.',
    enableGpsBtn: 'Enable GPS Co-Pilot',
    simulatingTitle: 'Simulated Driving Route (Demo Mode)',
    simulationDesc: 'Toggle simulation to preview real-time alerts without moving outdoors.',
    startSim: 'Start Route Demo',
    stopSim: 'Pause Demo',
    currentLocation: 'Current Position',
    drivingSpeed: 'Current Speed',
    upcomingHazards: 'Upcoming Road Hazards Ahead',
    noNearbyHazards: 'No immediate road hazards detected within your current corridor. Safe travels!',
    warningPrefixPothole: '⚠️ POTHOLE AHEAD',
    warningPrefixHighRisk: '🚨 HIGH-RISK HAZARD AHEAD',
    warningPrefixCaution: '⚠️ ROAD CAUTION',
    distanceAhead: 'ahead',
    soundToggle: 'Audio Alert Sound',
    soundOn: 'Sound Alerts ON',
    soundOff: 'Sound Alerts OFF',
    openGoogleMaps: 'Open in Navigation',
    riskLabel: 'Risk Score',
    confirmationsLabel: 'confirmations',
    nearMissesLabel: 'near misses'
  },

  // Road Health (/roads)
  roads: {
    title: 'Road Health Intelligence',
    subtitle: 'Corridor-level safety analytics for municipal planning and urban commuters.',
    healthIndex: 'Road Health Index',
    goodHealth: 'Good Health',
    moderateRisk: 'Moderate Risk',
    highRisk: 'High Risk',
    criticalRisk: 'Critical Risk',
    hazardsCount: 'Total Hazards',
    unresolvedCount: 'Unresolved',
    reopenedCount: 'Reopened',
    nearMissCount: 'Near Misses',
    viewHazards: 'View Hazards on Map'
  },

  // GroundFix AI Assistant
  assistant: {
    title: 'GroundFix Assistant',
    subtitle: 'Ask road safety & platform questions',
    greeting: 'Hello! I am your GroundFix Road Safety Assistant. How can I help you today?',
    placeholder: 'Ask a question (e.g. How to report a pothole?)...',
    send: 'Send',
    quickQuestionsTitle: 'Common Questions:',
    chipReport: 'How do I report a pothole?',
    chipTrack: 'How do I track a complaint?',
    chipRisk: 'What does risk score mean?',
    chipDriver: 'What is Driver Mode?',
    chipAuth: 'How does image verification work?',
    chipNearMiss: 'How does Near Miss reporting work?'
  }
};
