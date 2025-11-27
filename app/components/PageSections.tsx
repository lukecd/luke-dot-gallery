"use client";

import { useEffect } from "react";
import Navbar from "./Navbar";
import Home from "./Home";
import About from "./About";
import DevRel from "./DevRel";
import Music from "./Music";
import TvVideo from "./TvVideo";
import Contact from "./Contact";
import { SectionSlug, sectionSlugs, slugToSelector } from "../../lib/sections";

const NAVBAR_OFFSET = 80;

type PageSectionsProps = {
	sectionSlug: SectionSlug | null;
};

const scrollToSelector = (selector: string) => {
	const element = document.querySelector(selector);
	if (!element) {
		return;
	}

	const elementOffset = element.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
	window.scrollTo({ top: Math.max(0, elementOffset), behavior: "smooth" });
};

const PageSections = ({ sectionSlug }: PageSectionsProps) => {
	useEffect(() => {
		if (!sectionSlug) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}

		const selector = slugToSelector[sectionSlug];
		if (!selector) {
			return;
		}

		// Delay until next frame to ensure layout is ready
		const id = window.requestAnimationFrame(() => scrollToSelector(selector));
		return () => window.cancelAnimationFrame(id);
	}, [sectionSlug]);

	useEffect(() => {
		if (sectionSlug) {
			return;
		}

		const hash = window.location.hash;
		if (!hash) {
			return;
		}

		const normalizedSlug = hash.startsWith("#") ? hash.slice(1) : hash;
		const slugMatch = sectionSlugs.find((slug) => slug === normalizedSlug);
		const targetSelector = slugMatch ? slugToSelector[slugMatch] : hash;
		const id = window.requestAnimationFrame(() => scrollToSelector(targetSelector));
		return () => window.cancelAnimationFrame(id);
	}, [sectionSlug]);

	return (
		<div className="bg-[#15274c] text-[#f5ead9]">
			<Navbar />
			<Home />
			<About />
			<DevRel />
			<Music />
			<TvVideo />
			<Contact />
		</div>
	);
};

export default PageSections;

