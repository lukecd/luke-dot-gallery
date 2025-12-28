"use client";

import { useState, useEffect, useMemo } from "react";
import languageData from "../../lib/language-connections-data.json";

type Script = "Burmese" | "Thai" | "Devanagari" | "IPA";

type GridCell = {
	character: string;
	script: Script;
	ipa: string;
	place: string;
};

type LanguageData = {
	[key: string]: {
		ipa: string;
		characters: Array<{
			script: string;
			character: string;
			place: string;
			manner: string;
		}>;
	};
};

function generateGrid(selectedLanguages: Set<Script>): GridCell[] {
	const data = languageData as LanguageData;
	const grid: GridCell[] = Array(9).fill(null);
	const selectedArray = Array.from(selectedLanguages);
	
	// If no languages selected, return empty grid
	if (selectedArray.length === 0) {
		return grid;
	}

	// Filter out IPA from script matching (we'll handle it separately)
	const scriptLanguages = selectedArray.filter((lang) => lang !== "IPA");
	const includeIPA = selectedLanguages.has("IPA");

	// Find IPA sounds that have characters in ALL selected script languages
	const matchingIPAs: string[] = [];
	
	for (const [ipa, ipaData] of Object.entries(data)) {
		const scriptsInIPA = new Set(ipaData.characters.map((c) => c.script));
		const hasAllScripts = scriptLanguages.every((script) =>
			scriptsInIPA.has(script)
		);
		
		if (hasAllScripts && scriptLanguages.length > 0) {
			matchingIPAs.push(ipa);
		}
	}

	// If we have matching IPAs, pick one randomly for the match
	if (matchingIPAs.length > 0) {
		const matchIPA = matchingIPAs[Math.floor(Math.random() * matchingIPAs.length)];
		const matchData = data[matchIPA];
		
		// Get one character from each selected script language for this IPA
		const matchCharacters: GridCell[] = [];
		const usedMatchChars = new Set<string>();
		
		// Find a common place of articulation across all scripts for this IPA
		const placesByScript = new Map<string, Set<string>>();
		for (const script of scriptLanguages) {
			const scriptChars = matchData.characters.filter(
				(c) => c.script === script && !usedMatchChars.has(c.character)
			);
			const places = new Set(scriptChars.map((c) => c.place));
			placesByScript.set(script, places);
		}

		// Find places that exist in all scripts
		const commonPlaces = Array.from(placesByScript.values()).reduce((acc, places) => {
			return new Set([...acc].filter((place) => places.has(place)));
		}, placesByScript.get(scriptLanguages[0]) || new Set());

		// Pick a random common place, or use the first available if none common
		const matchPlace = commonPlaces.size > 0
			? Array.from(commonPlaces)[Math.floor(Math.random() * commonPlaces.size)]
			: matchData.characters[0]?.place || "guttural";

		// Get one character from each selected script language for this IPA and place
		for (const script of scriptLanguages) {
			const scriptChars = matchData.characters.filter(
				(c) => c.script === script && 
				       c.place === matchPlace && 
				       !usedMatchChars.has(c.character)
			);
			if (scriptChars.length > 0) {
				const randomChar = scriptChars[Math.floor(Math.random() * scriptChars.length)];
				matchCharacters.push({
					character: randomChar.character,
					script: script as Script,
					ipa: matchIPA,
					place: matchPlace,
				});
				usedMatchChars.add(randomChar.character);
			}
		}
		
		// If IPA is selected, add the IPA symbol itself
		if (includeIPA) {
			const ipaChar = `/${matchIPA}/`;
			if (!usedMatchChars.has(ipaChar)) {
				matchCharacters.push({
					character: ipaChar,
					script: "IPA",
					ipa: matchIPA,
					place: matchPlace,
				});
				usedMatchChars.add(ipaChar);
			}
		}

		// Place match characters in random positions
		const availablePositions = Array.from({ length: 9 }, (_, i) => i);
		const matchPositions: number[] = [];
		
		for (let i = 0; i < matchCharacters.length && availablePositions.length > 0; i++) {
			const randomIndex = Math.floor(Math.random() * availablePositions.length);
			const position = availablePositions.splice(randomIndex, 1)[0];
			matchPositions.push(position);
			grid[position] = matchCharacters[i];
		}

		// Debug: Log the match that was created
		console.log("Match created:", {
			ipa: matchIPA,
			characters: matchCharacters,
			positions: matchPositions
		});
	} else {
		console.warn("No matching IPAs found for selected languages:", scriptLanguages);
	}

	// Track which characters are already in the grid to prevent duplicates
	const placedCharacters = new Set<string>();
	for (const cell of grid) {
		if (cell) {
			placedCharacters.add(cell.character);
		}
	}

	// Fill remaining positions with random non-matching characters
	// Use a Map to deduplicate by character string
	const characterMap = new Map<string, GridCell>();
	
	for (const [ipa, ipaData] of Object.entries(data)) {
		for (const char of ipaData.characters) {
			// Only include characters from selected languages
			if (selectedArray.includes(char.script as Script)) {
				// Only add if not already in map (deduplicate)
				if (!characterMap.has(char.character)) {
					characterMap.set(char.character, {
						character: char.character,
						script: char.script as Script,
						ipa: ipa,
						place: char.place,
					});
				}
			}
		}
		
		// If IPA is selected, add IPA symbols for all sounds
		// Use the first place found for this IPA (since IPA doesn't have a specific place)
		if (includeIPA) {
			const ipaChar = `/${ipa}/`;
			if (!characterMap.has(ipaChar)) {
				const firstPlace = ipaData.characters[0]?.place || "guttural";
				characterMap.set(ipaChar, {
					character: ipaChar,
					script: "IPA",
					ipa: ipa,
					place: firstPlace,
				});
			}
		}
	}

	// Convert to array and filter out characters that are already placed
	const availableCharacters = Array.from(characterMap.values()).filter(
		(char) => !placedCharacters.has(char.character)
	);

	// Shuffle the available characters
	for (let i = availableCharacters.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[availableCharacters[i], availableCharacters[j]] = [availableCharacters[j], availableCharacters[i]];
	}

	// Fill empty grid positions with random characters (no duplicates)
	for (let i = 0; i < grid.length; i++) {
		if (!grid[i] && availableCharacters.length > 0) {
			const randomChar = availableCharacters.pop()!; // Remove from end (already shuffled)
			grid[i] = randomChar;
			placedCharacters.add(randomChar.character);
		}
	}

	// Final safety check: verify no duplicates
	const finalCharacters = grid.filter(cell => cell !== null).map(cell => cell!.character);
	const uniqueCharacters = new Set(finalCharacters);
	if (finalCharacters.length !== uniqueCharacters.size) {
		console.error("Duplicate characters detected in grid!", {
			total: finalCharacters.length,
			unique: uniqueCharacters.size,
			characters: finalCharacters
		});
	}

	return grid;
}

export default function LanguageConnections() {
	const [selectedLanguages, setSelectedLanguages] = useState<Set<Script>>(
		new Set(["Burmese", "Thai", "Devanagari", "IPA"])
	);
	const [highlightedSquares, setHighlightedSquares] = useState<Set<number>>(
		new Set()
	);
	const [score, setScore] = useState(0);
	const [gridKey, setGridKey] = useState(0); // Force grid regeneration
	const [animatingSquares, setAnimatingSquares] = useState<Set<number>>(
		new Set()
	);
	const [animationType, setAnimationType] = useState<"correct" | "incorrect" | null>(null);
	const [mounted, setMounted] = useState(false);
	const [showDebug, setShowDebug] = useState(false);

	// Only generate grid on client to avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	// Generate grid whenever selected languages change or gridKey changes
	const grid = useMemo(() => {
		if (!mounted) {
			// Return empty grid during SSR
			return Array(9).fill(null) as GridCell[];
		}
		return generateGrid(selectedLanguages);
	}, [selectedLanguages, gridKey, mounted]);

	const toggleLanguage = (script: Script) => {
		setSelectedLanguages((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(script)) {
				newSet.delete(script);
			} else {
				newSet.add(script);
			}
			return newSet;
		});
	};

	const checkMatch = (selectedIndices: Set<number>) => {
		if (selectedIndices.size < 2) return null;

		const selectedCells = Array.from(selectedIndices)
			.map((idx) => grid[idx])
			.filter((cell) => cell !== null);

		if (selectedCells.length < 2) return null;

		// Check if all selected cells have the same IPA AND place of articulation
		const firstIPA = selectedCells[0].ipa;
		const firstPlace = selectedCells[0].place;
		const allMatch = selectedCells.every(
			(cell) => cell.ipa === firstIPA && cell.place === firstPlace
		);

		// Debug logging
		console.log("Selected cells:", selectedCells);
		console.log("First IPA:", firstIPA, "First Place:", firstPlace);
		console.log("All match:", allMatch);

		return allMatch;
	};

	const toggleSquare = (index: number) => {
		// Don't allow clicking during animation
		if (animatingSquares.size > 0) return;

		setHighlightedSquares((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				newSet.add(index);
			}

			// Check for match when 2+ squares are selected
			if (newSet.size >= 2) {
				const isMatch = checkMatch(newSet);

				if (isMatch) {
					// Correct match - gold glow then fade
					setAnimatingSquares(new Set(newSet));
					setAnimationType("correct");

					// After glow, fade and regenerate
					setTimeout(() => {
						setHighlightedSquares(new Set());
						setScore((prev) => prev + 1);
						setGridKey((prev) => prev + 1); // Regenerate grid
						setTimeout(() => {
							setAnimatingSquares(new Set());
							setAnimationType(null);
						}, 300);
					}, 1000);
				} else {
					// Incorrect match - shake and reject
					setAnimatingSquares(new Set(newSet));
					setAnimationType("incorrect");

					setTimeout(() => {
						setHighlightedSquares(new Set());
						setAnimatingSquares(new Set());
						setAnimationType(null);
					}, 600);
				}
			}

			return newSet;
		});
	};

	return (
		<div className="w-full h-full bg-[#15274c] text-[#f5ead9] min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center">
			<div className="w-full max-w-2xl flex flex-col items-center gap-4 relative">
				<div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-md gap-2">
					<h1 className="text-[#f36c3d] text-2xl sm:text-4xl font-bold">
						Language Connections
					</h1>
					<div className="text-[#f5ead9] text-lg sm:text-xl font-bold">
						Score: <span className="text-[#f36c3d]">{score}</span>
					</div>
				</div>

				{/* Game Area - Fixed Position */}
				<div className="flex flex-col items-center w-full max-w-md">
					{/* 3x3 Grid */}
					<div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
						{grid.map((cell, index) => {
							const isHighlighted = highlightedSquares.has(index);
							const isAnimating = animatingSquares.has(index);
							const isCorrect = animationType === "correct" && isAnimating;
							const isIncorrect = animationType === "incorrect" && isAnimating;

							return (
								<button
									key={`${gridKey}-${index}`}
									onClick={() => toggleSquare(index)}
									className={`
										aspect-square 
										text-[#15274c] 
										text-2xl sm:text-3xl
										font-bold 
										rounded-lg
										transition-all 
										duration-300
										hover:scale-110
										hover:shadow-lg
										hover:shadow-[#f36c3d]/50
										flex items-center justify-center
										${isCorrect
											? "animate-gold-glow-fade bg-[#ffd700]"
											: isIncorrect
											? "animate-shake bg-[#f5ead9]"
											: "bg-[#f5ead9]"
										}
										${isHighlighted && !isAnimating
											? "ring-2 sm:ring-4 ring-[#f36c3d] ring-offset-1 sm:ring-offset-2 ring-offset-[#15274c] animate-pulse" 
											: ""
										}
									`}
								>
									{cell ? cell.character : "?"}
								</button>
							);
						})}
					</div>
				</div>

				{/* Hints Panel - Positioned absolutely to the right */}
				<div className="hidden sm:block absolute top-0 right-0 transform translate-x-full ml-4">
					<button
						onClick={() => setShowDebug(!showDebug)}
						className="text-sm text-[#f5ead9] hover:text-[#f36c3d] transition-colors mb-2 whitespace-nowrap"
					>
						{showDebug ? "Hide" : "Show"} Hints
					</button>

					{showDebug && (
						<div className="bg-[#1a3a5c] p-4 rounded-lg text-sm w-[280px]">
							<div className="font-bold text-[#f36c3d] mb-2">Grid Contents:</div>
							<div className="grid grid-cols-3 gap-2">
								{grid.map((cell, index) => (
									<div key={index} className="text-[#f5ead9]">
										<div className="font-bold">{cell ? cell.character : "?"}</div>
										<div className="text-xs text-gray-400">
											{cell ? `${cell.script} - /${cell.ipa}/ (${cell.place})` : "empty"}
										</div>
									</div>
								))}
							</div>
							<div className="mt-4 text-[#f36c3d] font-bold text-xs">
								Matches to find: Characters with the same IPA and place of articulation
							</div>
						</div>
					)}
				</div>

				{/* Mobile Hints - Below game */}
				<div className="sm:hidden w-full max-w-md">
					<button
						onClick={() => setShowDebug(!showDebug)}
						className="text-sm text-[#f5ead9] hover:text-[#f36c3d] transition-colors mb-2"
					>
						{showDebug ? "Hide" : "Show"} Hints
					</button>

					{showDebug && (
						<div className="bg-[#1a3a5c] p-4 rounded-lg text-sm">
							<div className="font-bold text-[#f36c3d] mb-2">Grid Contents:</div>
							<div className="grid grid-cols-3 gap-2">
								{grid.map((cell, index) => (
									<div key={index} className="text-[#f5ead9]">
										<div className="font-bold">{cell ? cell.character : "?"}</div>
										<div className="text-xs text-gray-400">
											{cell ? `${cell.script} - /${cell.ipa}/ (${cell.place})` : "empty"}
										</div>
									</div>
								))}
							</div>
							<div className="mt-4 text-[#f36c3d] font-bold text-xs">
								Matches to find: Characters with the same IPA and place of articulation
							</div>
						</div>
					)}
				</div>

				{/* Language Checkboxes */}
				<div className="flex flex-wrap justify-center gap-4 sm:gap-6">
					{(["Burmese", "Thai", "Devanagari", "IPA"] as Script[]).map(
						(script) => (
							<label
								key={script}
								className="flex items-center gap-2 cursor-pointer group"
							>
								<input
									type="checkbox"
									checked={selectedLanguages.has(script)}
									onChange={() => toggleLanguage(script)}
									className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer accent-[#f36c3d]"
								/>
								<span className="text-base sm:text-xl group-hover:text-[#f36c3d] transition-colors">
									{script}
								</span>
							</label>
						)
					)}
				</div>

				{/* Instructions */}
				<div className="text-center text-[#f5ead9] text-sm sm:text-base max-w-md px-4">
					<p className="mb-2">
						Pick pairs or triplets that share the same sound and place. Select squares to spot similar sounds from different scripts.
					</p>
					<p>
						Find the phonetic pairs, pick the perfect matches, and watch your score soar!
					</p>
				</div>
			</div>
		</div>
	);
}
