"use client";

import { ReactNode } from "react";

type CardsRowProps = {
	count: number;
	children: ReactNode;
	className?: string;
};

export default function CardsRow({ count, children, className }: CardsRowProps) {
	// Use CSS Grid for proper 3-column layout on desktop
	const base = "grid gap-8";
	// Mobile: 1 column, center alignment
	const mobile = "grid-cols-1 justify-items-center";
	// Tablet (md): 2 columns, center when less than 2 items
	const md = count < 2 ? " md:grid-cols-1 md:justify-items-center" : " md:grid-cols-2 md:justify-items-start";
	// Desktop (lg): 3 columns, center when less than 3 items
	const lg = count === 1 ? " lg:grid-cols-1 lg:justify-items-center" : 
	           count === 2 ? " lg:grid-cols-2 lg:justify-items-center" : 
	           " lg:grid-cols-3 lg:justify-items-start";
	return (
		<div className={base + " " + mobile + md + lg + (className ? " " + className : "")}>{children}</div>
	);
}


