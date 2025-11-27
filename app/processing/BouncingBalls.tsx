"use client";

import React, { useEffect, useRef } from "react";
import p5 from "p5";
import sketch from "./sketch";

const BouncingBalls: React.FC = () => {
	const p5ContainerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!p5ContainerRef.current) {
			return;
		}

		const p5Instance = new p5(sketch, p5ContainerRef.current);

		return () => {
			p5Instance.remove();
		};
	}, []);

	return <div className="backgroundAnimation" ref={p5ContainerRef} />;
};

export default BouncingBalls;
