-- Update Privacy Policy page with comprehensive, well-structured content
UPDATE public.pages
SET 
  title = 'Privacy Policy',
  meta_title = 'Privacy Policy | EggRateToday',
  meta_description = 'Comprehensive Privacy Policy for EggRateToday explaining how we collect, use, store, and protect user data and cookie preferences.',
  content = '# Privacy Policy for EggRateToday

**Last Updated:** August 10, 2026  
**Effective Date:** August 10, 2026  

Welcome to **EggRateToday** (accessible at [https://www.egg-rate.today](https://www.egg-rate.today)). At EggRateToday, protecting your privacy and ensuring the security of your personal information is one of our highest priorities. This Privacy Policy document outlines the types of information we collect, how it is used, stored, and protected, and your rights regarding your personal data.

---

## 1. Information We Collect

We collect information to provide better services to all our users, ranging from basic traffic analytics to personalized daily egg price alert services.

### A. Personal Information You Provide Voluntarily
- **Email Address & Preferences:** When you subscribe to our daily egg rate alerts, newsletter, or create an account, we collect your email address and your preferred city/state notification settings.
- **Support & Communications:** If you contact us directly via email or through our contact form, we receive the details of your inquiry, including your name, email address, and the contents of your message.

### B. Automated & Technical Data Collection (Log Files)
Like most modern web applications, EggRateToday automatically collects standard server log data when you visit our platform:
- Internet Protocol (IP) address
- Browser type, language, and operating system
- Internet Service Provider (ISP)
- Date and time stamps of site visits
- Referring and exit pages, and click stream data

> **Note:** Log file data is strictly used for network security, diagnosing server performance, and aggregate traffic analysis. It is never linked to personally identifiable information.

---

## 2. How We Use Your Information

EggRateToday uses the collected data for the following legitimate business purposes:

- **Core Operations:** To deliver accurate, daily wholesale and retail egg rates across 4,600+ cities and 36 states/UTs in India.
- **Rate Notifications:** To send daily market updates and price trend alerts to opted-in subscribers.
- **Service Enhancement:** To analyze user interaction patterns, optimize page load speeds, and improve site layout and user experience.
- **Security & Fraud Prevention:** To monitor for malicious traffic, bot attacks, and illegal access attempts.
- **Customer Support:** To respond to user feedback, price discrepancy reports, and technical support requests.

---

## 3. Cookies and Tracking Technologies

EggRateToday uses cookies and local browser storage to enhance your browsing experience.

### Types of Cookies Used:
- **Essential / Functional Cookies:** Required for basic site navigation, dark/light theme preferences, and security session tokens.
- **Analytics Cookies:** Help us measure traffic sources and overall site usage patterns.
- **Advertising Cookies:** Used by third-party advertising partners to deliver relevant advertisements.

You can choose to disable or selectively turn off our cookies or third-party cookies in your browser settings. However, doing so may affect your ability to interact with certain interactive features on our site.

---

## 4. Advertising Partners & Google DoubleClick DART Cookies

We may work with third-party advertising networks, such as **Google AdSense**, to support and maintain our free public platform.

- **DART Cookies:** Google uses DART cookies to serve ads to our visitors based upon their visit to `www.egg-rate.today` and other sites across the Internet.
- **Opt-Out Choice:** Visitors may choose to decline or opt-out of personalized advertising cookies by visiting the [Google Ad Settings Page](https://adssettings.google.com) or the Network Advertising Initiative opt-out portal.

Our Privacy Policy does not apply to other advertisers or external websites. We strongly advise you to consult the respective Privacy Policies of these third-party ad servers for more detailed information on their practices.

---

## 5. Data Storage, Security & Retention

- **Data Protection:** We implement industry-standard encryption protocols (TLS/SSL) for all data transmitted between your browser and our servers.
- **Database Infrastructure:** User data is securely hosted using enterprise-grade database infrastructure with strict Row-Level Security (RLS) policies.
- **Data Retention:** We retain personal information only as long as necessary to fulfill the purposes outlined in this policy or until you request its deletion.

---

## 6. Your Data Rights & Deletion Requests

Depending on your jurisdiction, you have the following rights regarding your personal data:

- **Right to Access:** You have the right to request copies of the personal data we hold about you.
- **Right to Rectification:** You can request that we correct any inaccurate or incomplete information.
- **Right to Deletion (Erasure):** You have the right to request that we delete your email address and personal records from our system at any time.
- **Opt-Out Rights:** You can unsubscribe from our alert emails at any time using the "Unsubscribe" link at the bottom of any email.

To submit a data access or deletion request, please email us at **support@egg-rate.today**.

---

## 7. Children''s Privacy

EggRateToday does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe your child has provided personal data on our website, we strongly encourage you to contact us immediately, and we will promptly remove such information from our records.

---

## 8. Updates to This Privacy Policy

We may update our Privacy Policy periodically to reflect changes in legal requirements, operational practices, or service enhancements. Any changes will be posted on this page with an updated "Last Updated" timestamp. We encourage users to review this page regularly.

---

## 9. Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact us:

- **Email:** [support@egg-rate.today](mailto:support@egg-rate.today)
- **Contact Page:** [EggRateToday Contact Us](https://www.egg-rate.today/contact)
- **Address:** EggRateToday Operations, Mandi Tower, New Delhi - 110001, India
',
  updated_at = NOW()
WHERE slug IN ('privacy', 'privacy-policy');
