export const profile = {
  firstName: "Delmart",
  lastName: "Asensi",
  middleInitial: "B.",
  fullName: "Delmart B. Asensi",
  initials: "DA",
  school: "Assumption College of Davao",
  degree: "BS Information Technology",
  year: "3rd Year",
  location: "Davao City, Philippines",
  email: "your.email.address@gmail.com",
  bio: "Third-year Information Technology student who enjoys building clean, modern websites and tinkering with games in my free time. I like turning ideas into things people can actually use.",
} as const;

export const navItems = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

export const skillGroups = [
  {
    title: "Programming & Web",
    items: [
      { name: "HTML & CSS", level: 78 },
      { name: "JavaScript", level: 62 },
      { name: "React", level: 48 },
      { name: "Python", level: 45 },
      { name: "SQL / MySQL", level: 42 },
    ],
  },
  {
    title: "Design & Multimedia",
    items: [
      { name: "UI / Layout Design", level: 66 },
      { name: "Photo Editing", level: 58 },
      { name: "Typography", level: 60 },
      { name: "Video Editing", level: 46 },
    ],
  },
  {
    title: "Tools & Software",
    items: [
      { name: "VS Code", level: 80 },
      { name: "Figma", level: 52 },
      { name: "Adobe Photoshop", level: 48 },
      { name: "Git / GitHub", level: 44 },
    ],
  },
] as const;

export type SocialKey =
  | "email"
  | "github"
  | "twitter"
  | "roblox"
  | "discord";

export interface Social {
  key: SocialKey;
  label: string;
  handle: string;
  href: string;
}

export const socials: readonly Social[] = [
  {
    key: "email",
    label: "Gmail",
    handle: "your.email.address@gmail.com",
    href: "mailto:your.email.address@gmail.com",
  },
  {
    key: "github",
    label: "GitHub",
    handle: "@CertifiedWagyu",
    href: "https://github.com/CertifiedWagyu",
  },
  {
    key: "twitter",
    label: "Twitter",
    handle: "@DelmartAsensi",
    href: "https://twitter.com/DelmartAsensi",
  },
  {
    key: "roblox",
    label: "Roblox",
    handle: "@dalmart2",
    href: "https://www.roblox.com/users/10213774466/profile",
  },
  {
    key: "discord",
    label: "Discord",
    handle: "@senlikesfumo",
    /* Discord profiles only resolve by numeric ID, so this card copies the handle. */
    href: "",
  },
];