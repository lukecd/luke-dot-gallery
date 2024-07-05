import dynamic from "next/dynamic";

// Dynamically import the BouncingBalls component with server-side rendering disabled
const BouncingBalls = dynamic(() => import("./BouncingBalls"), {
	ssr: false,
});

export default BouncingBalls;
