"use client";

import Link from "next/link";
import { useHomeTab } from "@/hooks/use-home-tab";

function TabItem({
  href,
  isActive,
  title,
}: {
  href: string;
  isActive: boolean;
  title: string;
}) {
  if (isActive)
    return (
      <span className={`text-white font-semibold underline`}>{title}</span>
    );

  return (
    <Link href={href} className={`text-white opacity-45`}>
      {title}
    </Link>
  );
}

function HomeTab() {
  const { linkForTab, isActive } = useHomeTab();
  const tabs = [
    {
      // TEST#1
      href: linkForTab("register"),
      title: "Register",
      isActive: isActive("register"),
    },
    {
      // TEST#2
      href: linkForTab("resend-instruction"),
      title: "Resend Instruction",
      isActive: isActive("resend-instruction"),
    },
    {
      // TEST#3
      href: linkForTab("test-webhook"),
      title: "Test Webhook",
      isActive: isActive("test-webhook"),
    },
  ];

  return (
    <div className="flex space-x-6">
      <StaticHomeTab tabs={tabs} />
    </div>
  );
}

const placeholderTabs = [
  {
    href: "/",
    title: "Register",
    isActive: false,
  },
  {
    href: "/",
    title: "Resend Instruction",
    isActive: false,
  },

  {
    href: "/",
    title: "Test Webhook",
    isActive: false,
  },
];

export const PlaceholderHomeTab = () => {
  return <StaticHomeTab tabs={placeholderTabs} />;
};

export const StaticHomeTab = ({
  tabs,
}: {
  tabs: { href: string; title: string; isActive: boolean }[];
}) => {
  return (
    <div className="flex space-x-6">
      {tabs.map((tab) => (
        <TabItem key={tab.href} {...tab} />
      ))}
    </div>
  );
};

export default HomeTab;
