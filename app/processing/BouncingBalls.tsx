"use client";

import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";
import sketch from "./sketch";

const BouncingBalls: React.FC = () => {
	const p5ContainerRef = useRef<HTMLDivElement>(null);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		// Only set isClient to true after the component mounts, ensuring we are on the client side
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (isClient && p5ContainerRef.current) {
			const p5Instance = new p5(sketch, p5ContainerRef.current);

			return () => {
				p5Instance.remove();
			};
		}
	}, [isClient]);

	return <div className="backgroundAnimation" ref={p5ContainerRef} />;
};

export default BouncingBalls;
