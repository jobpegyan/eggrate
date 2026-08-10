INSERT INTO public.pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
    'privacy',
    'Privacy Policy',
    'At EggRate India, accessible from https://eggrateindia.lovable.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by EggRate India and how we use it.\n\nInformation We Collect\nThe personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information. If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.\n\nHow We Use Your Information\nWe use the information we collect in various ways, including to: Provide, operate, and maintain our website; Improve, personalize, and expand our website; Understand and analyze how you use our website; Develop new products, services, features, and functionality; Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes; Send you emails; Find and prevent fraud.\n\nLog Files\nEggRate India follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users movement on the website, and gathering demographic information.\n\nCookies and Web Beacons\nLike any other website, EggRate India uses "cookies". These cookies are used to store information including visitors preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users experience by customizing our web page content based on visitors browser type and/or other information.\n\nGoogle DoubleClick DART Cookie\nGoogle is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – https://policies.google.com/technologies/ads\n\nAdvertising Partners Privacy Policies\nYou may consult this list to find the Privacy Policy for each of the advertising partners of EggRate India. Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on EggRate India, which are sent directly to users browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.',
    'Privacy Policy | EggRate India',
    'Understand how EggRate India collects and uses your information to provide live egg rates across India.',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

INSERT INTO public.pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
    'terms',
    'Terms and Conditions',
    'Welcome to EggRate India!\n\nThese terms and conditions outline the rules and regulations for the use of EggRate Indias Website. By accessing this website we assume you accept these terms and conditions. Do not continue to use EggRate India if you do not agree to take all of the terms and conditions stated on this page.\n\nLicense\nUnless otherwise stated, EggRate India and/or its licensors own the intellectual property rights for all material on EggRate India. All intellectual property rights are reserved. You may access this from EggRate India for your own personal use subjected to restrictions set in these terms and conditions.\n\nYou must not: Republish material from EggRate India; Sell, rent or sub-license material from EggRate India; Reproduce, duplicate or copy material from EggRate India; Redistribute content from EggRate India.\n\nUser Comments\nParts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. EggRate India does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of EggRate India, its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions. To the extent permitted by applicable laws, EggRate India shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.\n\nHyperlinking to our Content\nThe following organizations may link to our Website without prior written approval: Government agencies; Search engines; News organizations; Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses; and System wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site.\n\nDisclaimer\nTo the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will: limit or exclude our or your liability for death or personal injury; limit or exclude our or your liability for fraud or fraudulent misrepresentation; limit any of our or your liabilities in any way that is not permitted under applicable law; or exclude any of our or your liabilities that may not be excluded under applicable law.',
    'Terms and Conditions | EggRate India',
    'Read the terms and conditions for using the EggRate India platform.',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

INSERT INTO public.pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
    'disclaimer',
    'Disclaimer',
    'If you require any more information or have any questions about our sites disclaimer, please feel free to contact us by email.\n\nDisclaimers for EggRate India\nAll the information on this website - https://eggrateindia.lovable.app - is published in good faith and for general information purpose only. EggRate India does not make any warranties about the completeness, reliability and accuracy of this information. Any action you take upon the information you find on this website (EggRate India), is strictly at your own risk. EggRate India will not be liable for any losses and/or damages in connection with the use of our website.\n\nFrom our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites. These links to other websites do not imply a recommendation for all the content found on these sites. Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone "bad".\n\nPlease be also aware that when you leave our website, other sites may have different privacy policies and terms which are beyond our control. Please be sure to check the Privacy Policies of these sites as well as their "Terms of Service" before engaging in any business or uploading any information.\n\nConsent\nBy using our website, you hereby consent to our disclaimer and agree to its terms.\n\nUpdate\nShould we update, amend or make any changes to this document, those changes will be prominently posted here.',
    'Disclaimer | EggRate India',
    'Important legal disclaimer regarding the accuracy of egg rates and external links on EggRate India.',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

INSERT INTO public.pages (slug, title, content, meta_title, meta_description, is_published)
VALUES (
    'contact',
    'Contact Us',
    'We love to hear from our users. Whether you have a question about egg prices, want to report a discrepancy, or are interested in advertising on EggRate India, please get in touch.\n\nEmail Us\nFor any queries, please reach out to us at: support@eggrateindia.com\n\nOffice Address\nEggRate India HQ\n123 Market Street, Mandi Tower\nNew Delhi, 110001\nIndia\n\nAdvertising Enquiries\nIf you are interested in placing ads on our platform to reach thousands of traders and retailers across India, please email our ad desk at ads@eggrateindia.com.\n\nSupport Hours\nMonday - Friday: 9:00 AM - 6:00 PM IST\nSaturday: 10:00 AM - 2:00 PM IST\nSunday: Closed',
    'Contact Us | EggRate India',
    'Get in touch with the EggRate India team for support or advertising enquiries.',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();