"use client";

import { navigateToLaunch } from "../lib/projectNavigation";

export function MastheadHome() {
  return <button className="masthead-home" type="button" onClick={navigateToLaunch}>LUKE / PERSONAL TRANSMISSION</button>;
}
