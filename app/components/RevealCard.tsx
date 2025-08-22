"use client";

import Image from "next/image";
import { ReactNode, useCallback } from "react";

type RevealCardProps = {
	imageUrl?: string | null;
	title: string;
	subtitle?: string;
	isOpen: boolean;
	onToggle: () => void;
	children?: ReactNode;
};

export default function RevealCard({ imageUrl, title, subtitle, isOpen, onToggle, children }: RevealCardProps) {
	const handleKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onToggle();
		}
	}, [onToggle]);

	return (
		<div
			role="button"
			tabIndex={0}
			aria-expanded={isOpen}
			onClick={onToggle}
			onKeyDown={handleKey}
			className="relative group p-8 rounded-2xl border transition-all duration-300 active:scale-[0.99] focus:outline-none focus:ring focus:ring-[#509887]/40 w-full"
			style={{ backgroundColor: "#0C0D0D", borderColor: isOpen ? "#2A2B2B" : "#1A1B1B" }}
		>
			{/* Background duplicated image with teal overlay */}
			<div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
				{imageUrl ? (
					<div className="absolute inset-0">
						<Image src={imageUrl} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover opacity-10 scale-110" />
						<div className="absolute inset-0" style={{ backgroundColor: "#509887", opacity: 0.06 }} />
					</div>
				) : (
					<div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(80,152,135,0.08), transparent)" }} />
				)}
				{/* Futuristic subtle frame glow */}
				<div className="absolute inset-0 rounded-2xl ring-1 transition-colors" style={{ boxShadow: isOpen ? "0 0 0 1px #2A2B2B, 0 8px 30px rgba(0,0,0,0.45)" : "0 0 0 1px #1A1B1B, 0 6px 22px rgba(0,0,0,0.35)" }} />
			</div>

			<div className="relative">
				{/* Avatar / Image */}
				<div className="mx-auto mb-6 w-32 h-32 rounded-full overflow-hidden ring-1 ring-[#1A1B1B] group-hover:ring-[#509887]/40 transition-all">
					{imageUrl ? (
						<Image src={imageUrl} alt={title} width={128} height={128} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
					) : (
						<div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: "#509887", color: "#090A0A" }}>
							{title.charAt(0)}
						</div>
					)}
				</div>

				{/* Text */}
				<h3 className="text-center text-2xl font-semibold" style={{ color: "#E7E7E7" }}>{title}</h3>
				{subtitle && (
					<p className="text-center text-base mt-1" style={{ color: "#509887" }}>{subtitle}</p>
				)}

				{/* Reveal area */}
				<div className="mt-4 overflow-hidden transition-all duration-500" style={{ maxHeight: isOpen ? 600 : 0, opacity: isOpen ? 1 : 0 }}>
					<div className="pt-2" style={{ color: "#8C8D8D" }}>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}


