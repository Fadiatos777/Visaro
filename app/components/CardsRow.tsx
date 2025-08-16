"use client";

import { ReactNode } from "react";

type CardsRowProps = {
	count: number;
	children: ReactNode;
	className?: string;
};

export default function CardsRow({ count, children, className }: CardsRowProps) {
	const base = "flex flex-wrap gap-8";
	// Mobile: always centered
	const mobile = "justify-center";
	// Tablet (md): capacity 2 → center when 1 card
	const md = count < 2 ? " md:justify-center" : " md:justify-start";
	// Desktop (lg): capacity 3 → center when 1–2 cards
	const lg = count < 3 ? " lg:justify-center" : " lg:justify-start";
	return (
		<div className={base + " " + mobile + md + lg + (className ? " " + className : "")}>{children}</div>
	);
}


