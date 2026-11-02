"use client";
import { navigateToLaunch } from "../lib/projectNavigation";
import { SiteSectionNavigation } from "./SiteSectionNavigation";
export function MastheadHome() { return <SiteSectionNavigation active="portfolio" onPortfolioHome={navigateToLaunch} />; }
