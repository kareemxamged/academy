/**
 * دوال مساعدة للواتساب
 * WhatsApp Helper Functions
 */

/**
 * تنظيف رقم الهاتف وإزالة الرموز غير المرغوب فيها
 * Clean phone number and remove unwanted characters
 */
export const cleanPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';

  // إزالة جميع الرموز والمسافات
  let cleaned = phoneNumber.replace(/[^\d]/g, '');

  // قائمة برموز الدول الشائعة
  const countryCodes = ['966', '971', '965', '973', '968', '974', '20', '1', '44', '33', '49', '39', '34', '31', '32', '41', '43', '45', '46', '47', '48', '420', '421', '36', '40', '359', '385', '386', '387', '381', '382', '383', '389', '30', '357', '90', '972', '98', '964', '962', '961', '963', '967', '968', '92', '93', '880', '91', '94', '95', '60', '65', '66', '84', '86', '82', '81', '63', '62', '852', '853', '886', '7', '380', '375', '370', '371', '372', '358', '354', '353', '351', '350', '376', '377', '378', '39066', '39349', '423', '41', '43', '49', '33', '32', '31', '45', '46', '47', '48', '420', '421', '36', '40', '359', '385', '386', '387', '381', '382', '383', '389', '30', '357', '90', '972', '98', '964', '962', '961', '963', '967'];

  // التحقق من وجود رمز دولة في بداية الرقم
  const hasCountryCode = countryCodes.some(code => cleaned.startsWith(code));

  // إذا كان الرقم يبدأ بـ 0، استبدله بـ 966 (للأرقام السعودية المحلية)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '966' + cleaned.substring(1);
  }
  // إذا كان الرقم 9 أرقام ولا يبدأ برمز دولة، أضف 966 (رقم سعودي بدون 0)
  else if (cleaned.length === 9 && cleaned.startsWith('5') && !hasCountryCode) {
    cleaned = '966' + cleaned;
  }
  // إذا كان الرقم أقل من 10 أرقام ولا يحتوي على رمز دولة، أضف 966
  else if (cleaned.length < 10 && !hasCountryCode) {
    cleaned = '966' + cleaned;
  }

  return cleaned;
};

/**
 * تنسيق رقم الهاتف للعرض
 * Format phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  if (cleaned.length === 12 && cleaned.startsWith('966')) {
    // تنسيق: +966 50 123 4567
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  }
  
  return phoneNumber; // إرجاع الرقم كما هو إذا لم يكن بالتنسيق المتوقع
};

/**
 * إنشاء رابط واتساب مع رسالة
 * Generate WhatsApp link with message
 */
export const generateWhatsAppLink = (phoneNumber: string, message?: string): string => {
  const cleanedNumber = cleanPhoneNumber(phoneNumber);
  
  if (!cleanedNumber) {
    console.warn('رقم الواتساب غير صحيح:', phoneNumber);
    return '#';
  }
  
  let url = `https://wa.me/${cleanedNumber}`;
  
  if (message && message.trim()) {
    url += `?text=${encodeURIComponent(message.trim())}`;
  }
  
  return url;
};

/**
 * إنشاء رابط واتساب للتسجيل في دورة
 * Generate WhatsApp link for course enrollment
 */
export const generateCourseEnrollmentLink = (phoneNumber: string, courseTitle: string): string => {
  const message = `مرحباً، أريد التسجيل في دورة: ${courseTitle}`;
  return generateWhatsAppLink(phoneNumber, message);
};

/**
 * إنشاء رابط واتساب للاستفسار العام
 * Generate WhatsApp link for general inquiry
 */
export const generateGeneralInquiryLink = (phoneNumber: string): string => {
  const message = 'مرحباً، أريد الاستفسار عن دورات الرسم في أكاديمية ميمو';
  return generateWhatsAppLink(phoneNumber, message);
};

/**
 * إنشاء رابط واتساب للتواصل مع مدرب
 * Generate WhatsApp link for instructor contact
 */
export const generateInstructorContactLink = (phoneNumber: string, instructorName: string): string => {
  const message = `مرحباً، أريد التواصل مع المدرب ${instructorName}`;
  return generateWhatsAppLink(phoneNumber, message);
};

/**
 * إنشاء رابط فايبر
 * Generate Viber link
 */
export const generateViberLink = (phoneNumber: string): string => {
  const cleanedNumber = cleanPhoneNumber(phoneNumber);
  return `viber://chat?number=${cleanedNumber}`;
};

/**
 * إنشاء رابط المكالمة الهاتفية
 * Generate phone call link
 */
export const generatePhoneCallLink = (phoneNumber: string): string => {
  const formatted = formatPhoneNumber(phoneNumber);
  return `tel:${formatted}`;
};

/**
 * التحقق من صحة رقم الهاتف السعودي
 * Validate Saudi phone number
 */
export const isValidSaudiPhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  // يجب أن يبدأ بـ 966 ويكون 12 رقم
  if (!cleaned.startsWith('966') || cleaned.length !== 12) {
    return false;
  }
  
  // يجب أن يبدأ الرقم المحلي بـ 5 (للجوال)
  const localNumber = cleaned.substring(3);
  return localNumber.startsWith('5') && localNumber.length === 9;
};

export default {
  cleanPhoneNumber,
  formatPhoneNumber,
  generateWhatsAppLink,
  generateCourseEnrollmentLink,
  generateGeneralInquiryLink,
  generateInstructorContactLink,
  generateViberLink,
  generatePhoneCallLink,
  isValidSaudiPhoneNumber
};
