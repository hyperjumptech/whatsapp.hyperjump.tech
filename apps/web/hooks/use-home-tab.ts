"use client";
import { notFound, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const tabs = ["register", "resend-instruction", "test-webhook"] as const;
export type Tab = (typeof tabs)[number];

/**
 * Return type for the useHomeTab hook.
 */
export type UseHomeTabReturn = {
  /** The currently active tab from URL search params, defaults to "register" */
  tab: Tab;
  /** Function to check if a given tab is currently active. Returns true if the tab matches the current tab from URL params. */
  isActive: (tab: Tab) => boolean;
  /** Function to generate the navigation link for a given tab. Returns "/test-webhook" for test-webhook tab, otherwise "/?tab={tabName}". */
  linkForTab: (tab: Tab) => string;
};

/**
 * Hook to handle the home tab navigation.
 * @returns {UseHomeTabReturn}
 */
export const useHomeTab = (): UseHomeTabReturn => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // TEST#1
  const currentTab =
    (pathname === "/test-webhook"
      ? "test-webhook"
      : (searchParams.get("tab") as Tab)) || "register";

  // TEST#4
  if (!tabs.includes(currentTab)) {
    notFound();
  }

  const isActive = useCallback(
    (tab: Tab) => {
      // TEST#2
      return currentTab === tab;
    },
    [currentTab, pathname]
  );

  // TEST#3
  const linkForTab = useCallback((tab: Tab) => {
    return tab === "test-webhook" ? "/test-webhook" : `/?tab=${tab}`;
  }, []);

  return {
    tab: currentTab,
    isActive,
    linkForTab,
  };
};
