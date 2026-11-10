// All questions the marketing wizard asks live here.
// Add, remove or edit fields without touching the wizard component.

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "url"
  | "number"
  | "select"
  | "radio"
  | "multiselect";

export type FieldOption = { value: string; label: string };

export type Field = {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: FieldOption[];
  /** Only show this field when another field in the same form has one of these values. */
  showIf?: { field: string; values: string[] };
};

export type Service = {
  id: ServiceId;
  name: string;
  summary: string;
  fields: Field[];
};

export type ServiceId = "campaigning" | "seo" | "social";

const opts = (...labels: string[]): FieldOption[] =>
  labels.map((label) => ({
    value: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    label,
  }));

const yesNo = opts("Yes", "No");

export const SERVICES: Service[] = [
  {
    id: "campaigning",
    name: "Campaigning",
    summary: "Paid ads and email campaigns that bring in leads and sales.",
    fields: [
      {
        id: "channels",
        label: "Which channels do you want to run campaigns on?",
        type: "multiselect",
        required: true,
        options: opts("Google Ads", "Meta (Facebook & Instagram)", "LinkedIn Ads", "TikTok Ads", "Email marketing"),
      },
      {
        id: "campaignGoal",
        label: "What should the campaigns achieve?",
        type: "radio",
        required: true,
        options: opts("Generate leads", "Drive online sales", "Build brand awareness", "Increase website traffic"),
      },
      {
        id: "adSpend",
        label: "Monthly ad spend (paid to the ad platforms, separate from our fee)",
        type: "select",
        required: true,
        options: opts("Under $1,000", "$1,000 – $5,000", "$5,000 – $15,000", "$15,000+", "Not sure yet"),
      },
      {
        id: "targetLocations",
        label: "Where are the people you want to reach?",
        type: "text",
        placeholder: "e.g. Sydney metro, all of Australia, US & Canada",
      },
      {
        id: "existingAdAccounts",
        label: "Do you already have ad accounts set up?",
        type: "radio",
        options: yesNo,
      },
      {
        id: "emailListSize",
        label: "Roughly how many contacts are on your email list?",
        type: "select",
        options: opts("None yet", "Under 1,000", "1,000 – 10,000", "10,000+"),
        showIf: { field: "channels", values: ["email-marketing"] },
      },
      {
        id: "creativeNeeds",
        label: "What do you need us to create?",
        type: "multiselect",
        options: opts("Ad copy", "Ad graphics", "Video ads", "Landing pages", "Email templates"),
      },
    ],
  },
  {
    id: "seo",
    name: "SEO",
    summary: "Rank higher on Google and get found by people already searching.",
    fields: [
      {
        id: "platform",
        label: "What is your website built on?",
        type: "select",
        required: true,
        options: opts("WordPress", "Shopify", "Wix", "Squarespace", "Webflow", "Custom build", "Not sure"),
      },
      {
        id: "pageCount",
        label: "Roughly how many pages does your site have?",
        type: "select",
        options: opts("Under 10", "10 – 50", "50 – 200", "200+"),
      },
      {
        id: "seoScope",
        label: "Who are you trying to reach?",
        type: "radio",
        required: true,
        options: opts("Local customers", "Customers nationwide", "International customers"),
      },
      {
        id: "locationCount",
        label: "How many physical business locations do you have?",
        type: "number",
        placeholder: "e.g. 1",
        showIf: { field: "seoScope", values: ["local-customers"] },
      },
      {
        id: "keywords",
        label: "What would customers type into Google to find you?",
        type: "textarea",
        placeholder: "e.g. emergency plumber brisbane, hot water repair",
      },
      {
        id: "competitors",
        label: "Who are your main competitors? (websites if you know them)",
        type: "textarea",
      },
      {
        id: "previousSeo",
        label: "Have you done SEO before?",
        type: "radio",
        options: opts("Never", "Yes, in-house", "Yes, with another agency"),
      },
      {
        id: "seoAddons",
        label: "Anything specific you need?",
        type: "multiselect",
        options: opts("Technical site audit", "Blog / article writing", "Link building", "Google Business Profile setup", "Speed optimisation"),
      },
    ],
  },
  {
    id: "social",
    name: "Social Media",
    summary: "Content and community management that keeps your brand active.",
    fields: [
      {
        id: "platforms",
        label: "Which platforms should we manage?",
        type: "multiselect",
        required: true,
        options: opts("Facebook", "Instagram", "LinkedIn", "TikTok", "X (Twitter)", "YouTube"),
      },
      {
        id: "postsPerWeek",
        label: "How often should we post?",
        type: "select",
        required: true,
        options: opts("1 – 2 posts a week", "3 – 4 posts a week", "5+ posts a week", "Not sure, recommend"),
      },
      {
        id: "contentTypes",
        label: "What kind of content do you want?",
        type: "multiselect",
        options: opts("Graphics", "Photo posts", "Short videos / Reels", "Carousels", "Stories"),
      },
      {
        id: "communityManagement",
        label: "Should we reply to comments and messages for you?",
        type: "radio",
        options: yesNo,
      },
      {
        id: "paidBoosting",
        label: "Do you want to boost posts with paid promotion?",
        type: "radio",
        options: yesNo,
      },
      {
        id: "existingAccounts",
        label: "Do you already have accounts on these platforms?",
        type: "radio",
        options: opts("Yes, all of them", "Some of them", "No, start from scratch"),
      },
      {
        id: "brandGuidelines",
        label: "Do you have brand guidelines (logo, colours, tone of voice)?",
        type: "radio",
        options: yesNo,
      },
    ],
  },
];

/** Asked once, whatever services were picked. */
export const BUSINESS_FIELDS: Field[] = [
  { id: "businessName", label: "Business name", type: "text", required: true },
  { id: "website", label: "Website", type: "url", placeholder: "https://" },
  { id: "industry", label: "Industry", type: "text", required: true, placeholder: "e.g. Plumbing, Dental, E-commerce" },
  { id: "location", label: "Where is your business based?", type: "text", required: true },
  {
    id: "budget",
    label: "Monthly budget for our services",
    type: "select",
    required: true,
    options: opts("Under $1,000", "$1,000 – $2,500", "$2,500 – $5,000", "$5,000+", "Not sure yet"),
  },
  {
    id: "startDate",
    label: "When would you like to start?",
    type: "select",
    required: true,
    options: opts("As soon as possible", "Within a month", "In 1 – 3 months", "Just exploring"),
  },
  { id: "goals", label: "Anything else we should know about your goals?", type: "textarea" },
];

export const CONTACT_FIELDS: Field[] = [
  { id: "fullName", label: "Your name", type: "text", required: true },
  { id: "email", label: "Email", type: "email", required: true },
  { id: "phone", label: "Phone", type: "tel" },
  {
    id: "contactPreference",
    label: "How should we contact you?",
    type: "radio",
    options: opts("Email", "Phone call", "Either"),
  },
];
