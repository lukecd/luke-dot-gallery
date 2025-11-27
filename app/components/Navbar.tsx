"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
import { SECTION_LINKS } from "../../lib/sections";

const navbarLinks = [{ href: "/", label: "Home" }, ...SECTION_LINKS.map((link) => ({ href: `/${link.slug}`, label: link.label }))];

const Navbar: React.FC = () => {
	const [nav, setNav] = useState(false);
	const toggleNav = () => setNav((prev) => !prev);
	const closeNav = () => setNav(false);

	return (
		<div className="fixed w-full h-[80px] flex justify-between items-center px-4 bg-[#f5ead9] text-[#15274c] z-10">
			<div>
				<Image src="/images/logo-sun.png" alt="Sun" width={48} height={48} />
			</div>
			{/* Desktop Menu */}
			<ul className="hidden md:flex">
				{navbarLinks.map(({ href, label }) => (
					<li key={href}>
						<Link
							scroll={false}
							href={href}
							onClick={closeNav}
							className="hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-2 mx-2 capitalize transition-colors duration-300 cursor-pointer"
						>
							{label}
						</Link>
					</li>
				))}
			</ul>
			{/* Hamburger */}
			<button type="button" onClick={toggleNav} className="md:hidden z-10 cursor-pointer" aria-label="Toggle menu">
				{!nav ? <FaBars /> : <FaTimes />}
			</button>
			{/* Mobile Menu */}
			<ul
				className={`absolute top-0 left-0 w-full h-screen bg-[#f5ead9] text-[#15274c] flex flex-col justify-center items-center transition-transform duration-300 ${
					nav ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{navbarLinks.map(({ href, label }) => (
					<li key={href} className="py-6 text-4xl">
						<Link scroll={false} href={href} onClick={closeNav} className="cursor-pointer">
							{label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Navbar;
