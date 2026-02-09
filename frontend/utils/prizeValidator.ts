/**
 * Prize Pattern Validation Utility
 * Implements all Tambola prize patterns for ticket validation
 */

export interface Ticket {
    id: string;
    ticket_number: number;
    player_id: string;
    player_name: string;
    grid: (number | null)[][];
    numbers: number[];
}

/**
 * Check if a ticket has won a specific prize pattern
 * @param ticket - The ticket to check
 * @param prizeType - The prize pattern ID
 * @param calledNumbers - Array of numbers that have been called
 * @returns true if the ticket has won the prize
 */
export const checkPrizeWin = (
    ticket: Ticket,
    prizeType: string,
    calledNumbers: number[]
): boolean => {
    const grid = ticket.grid;
    const numbers = ticket.numbers;

    switch (prizeType) {
        // ========== CORNERS ==========
        case 'c1': // 4 Corners
        case '4corners':
            return check4Corners(grid, calledNumbers);

        case 'c2': // King Corners
            return checkKingCorners(grid, calledNumbers);

        case 'c3': // Queen Corners
            return checkQueenCorners(grid, calledNumbers);

        case 'c4': // 4 Corner and Center
            return check4CornersAndCenter(grid, calledNumbers);

        case 'c5': // Bulls Eyes
            return checkBullsEyes(grid, calledNumbers);

        case 'c6': // Twin Lines
            return checkTwinLines(grid, calledNumbers);

        case 'c7': // 6 Corners
            return check6Corners(grid, calledNumbers);

        case 'c8': // 6 Corners and Center
            return check6CornersAndCenter(grid, calledNumbers);

        case 'c9': // Reverse Twin
            return checkReverseTwin(grid, calledNumbers);

        // ========== EARLY / JALDI ==========
        case 'e1': // Early 5
        case 'early5':
            return checkEarly5(numbers, calledNumbers);

        case 'e2': // Jaldi 5
            return checkJaldi5(numbers, calledNumbers);

        case 'e3': // Quickly 7
            return checkQuickly7(numbers, calledNumbers);

        case 'e4': // Lucky 9
            return checkLucky9(numbers, calledNumbers);

        // ========== ROW / LINE ==========
        case 'r1': // Top Line
        case 'topline':
            return checkTopLine(grid, calledNumbers);

        case 'r2': // Middle Line
        case 'middleline':
            return checkMiddleLine(grid, calledNumbers);

        case 'r3': // Bottom Line
        case 'bottomline':
            return checkBottomLine(grid, calledNumbers);

        case 'r4': // Any Line
            return checkAnyLine(grid, calledNumbers);

        case 'r5': // 2 Lines
            return check2Lines(grid, calledNumbers);

        // ========== HOUSE ==========
        case 'h1': // Full House
        case 'fullhouse':
            return checkFullHouse(numbers, calledNumbers);

        case 'h2': // Half House
            return checkHalfHouse(numbers, calledNumbers);

        default:
            return false;
    }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get the first number in a row (leftmost non-null)
 */
const getFirstInRow = (row: (number | null)[]): number | null => {
    for (const num of row) {
        if (num !== null) return num;
    }
    return null;
};

/**
 * Get the last number in a row (rightmost non-null)
 */
const getLastInRow = (row: (number | null)[]): number | null => {
    for (let i = row.length - 1; i >= 0; i--) {
        if (row[i] !== null) return row[i];
    }
    return null;
};

/**
 * Get the center number in a row (middle non-null)
 */
const getCenterInRow = (row: (number | null)[]): number | null => {
    const nonNullIndices = row
        .map((val, idx) => (val !== null ? idx : -1))
        .filter(idx => idx !== -1);
    if (nonNullIndices.length === 0) return null;
    const centerIdx = nonNullIndices[Math.floor(nonNullIndices.length / 2)];
    return row[centerIdx];
};

/**
 * Check if all numbers in array are called
 */
const allCalled = (nums: (number | null)[], called: number[]): boolean => {
    return nums.filter(n => n !== null).every(n => called.includes(n!));
};

// ========== CORNER PATTERNS ==========

/**
 * 4 Corners: All 4 corner numbers of the ticket
 */
const check4Corners = (grid: (number | null)[][], called: number[]): boolean => {
    const topLeft = getFirstInRow(grid[0]);
    const topRight = getLastInRow(grid[0]);
    const bottomLeft = getFirstInRow(grid[2]);
    const bottomRight = getLastInRow(grid[2]);

    return allCalled([topLeft, topRight, bottomLeft, bottomRight], called);
};

/**
 * King Corners: Top 2 corners + center of bottom row
 */
const checkKingCorners = (grid: (number | null)[][], called: number[]): boolean => {
    const topLeft = getFirstInRow(grid[0]);
    const topRight = getLastInRow(grid[0]);
    const bottomCenter = getCenterInRow(grid[2]);

    return allCalled([topLeft, topRight, bottomCenter], called);
};

/**
 * Queen Corners: Bottom 2 corners + center of top row
 */
const checkQueenCorners = (grid: (number | null)[][], called: number[]): boolean => {
    const topCenter = getCenterInRow(grid[0]);
    const bottomLeft = getFirstInRow(grid[2]);
    const bottomRight = getLastInRow(grid[2]);

    return allCalled([topCenter, bottomLeft, bottomRight], called);
};

/**
 * 4 Corner and Center: All 4 corners + center of middle row
 */
const check4CornersAndCenter = (grid: (number | null)[][], called: number[]): boolean => {
    const topLeft = getFirstInRow(grid[0]);
    const topRight = getLastInRow(grid[0]);
    const middleCenter = getCenterInRow(grid[1]);
    const bottomLeft = getFirstInRow(grid[2]);
    const bottomRight = getLastInRow(grid[2]);

    return allCalled([topLeft, topRight, middleCenter, bottomLeft, bottomRight], called);
};

/**
 * Bulls Eyes: Centers of all 3 rows
 */
const checkBullsEyes = (grid: (number | null)[][], called: number[]): boolean => {
    const topCenter = getCenterInRow(grid[0]);
    const middleCenter = getCenterInRow(grid[1]);
    const bottomCenter = getCenterInRow(grid[2]);

    return allCalled([topCenter, middleCenter, bottomCenter], called);
};

/**
 * Twin Lines: First and last number of each row (6 numbers total)
 */
const checkTwinLines = (grid: (number | null)[][], called: number[]): boolean => {
    const nums = [
        getFirstInRow(grid[0]),
        getLastInRow(grid[0]),
        getFirstInRow(grid[1]),
        getLastInRow(grid[1]),
        getFirstInRow(grid[2]),
        getLastInRow(grid[2]),
    ];

    return allCalled(nums, called);
};

/**
 * 6 Corners: First and last of top + middle rows (not bottom)
 */
const check6Corners = (grid: (number | null)[][], called: number[]): boolean => {
    const nums = [
        getFirstInRow(grid[0]),
        getLastInRow(grid[0]),
        getFirstInRow(grid[1]),
        getLastInRow(grid[1]),
        getFirstInRow(grid[2]),
        getLastInRow(grid[2]),
    ];

    return allCalled(nums, called);
};

/**
 * 6 Corners and Center: 6 corners + center of middle row
 */
const check6CornersAndCenter = (grid: (number | null)[][], called: number[]): boolean => {
    const nums = [
        getFirstInRow(grid[0]),
        getLastInRow(grid[0]),
        getFirstInRow(grid[1]),
        getCenterInRow(grid[1]),
        getLastInRow(grid[1]),
        getFirstInRow(grid[2]),
        getLastInRow(grid[2]),
    ];

    return allCalled(nums, called);
};

/**
 * Reverse Twin: Last and first of each row (opposite of Twin Lines)
 */
const checkReverseTwin = (grid: (number | null)[][], called: number[]): boolean => {
    // Same as Twin Lines (first and last are the same regardless of order)
    return checkTwinLines(grid, called);
};

// ========== EARLY / JALDI PATTERNS ==========

/**
 * Early 5: First 5 numbers of the ticket
 */
const checkEarly5 = (numbers: number[], called: number[]): boolean => {
    return numbers.slice(0, 5).every(n => called.includes(n));
};

/**
 * Jaldi 5: First 5 numbers (same as Early 5)
 */
const checkJaldi5 = (numbers: number[], called: number[]): boolean => {
    return checkEarly5(numbers, called);
};

/**
 * Quickly 7: First 7 numbers of the ticket
 */
const checkQuickly7 = (numbers: number[], called: number[]): boolean => {
    return numbers.slice(0, 7).every(n => called.includes(n));
};

/**
 * Lucky 9: First 9 numbers of the ticket
 */
const checkLucky9 = (numbers: number[], called: number[]): boolean => {
    return numbers.slice(0, 9).every(n => called.includes(n));
};

// ========== LINE PATTERNS ==========

/**
 * Top Line: All numbers in top row
 */
const checkTopLine = (grid: (number | null)[][], called: number[]): boolean => {
    return allCalled(grid[0], called);
};

/**
 * Middle Line: All numbers in middle row
 */
const checkMiddleLine = (grid: (number | null)[][], called: number[]): boolean => {
    return allCalled(grid[1], called);
};

/**
 * Bottom Line: All numbers in bottom row
 */
const checkBottomLine = (grid: (number | null)[][], called: number[]): boolean => {
    return allCalled(grid[2], called);
};

/**
 * Any Line: At least one complete row
 */
const checkAnyLine = (grid: (number | null)[][], called: number[]): boolean => {
    return (
        checkTopLine(grid, called) ||
        checkMiddleLine(grid, called) ||
        checkBottomLine(grid, called)
    );
};

/**
 * 2 Lines: Any two complete rows
 */
const check2Lines = (grid: (number | null)[][], called: number[]): boolean => {
    const linesComplete = [
        checkTopLine(grid, called),
        checkMiddleLine(grid, called),
        checkBottomLine(grid, called),
    ].filter(Boolean).length;

    return linesComplete >= 2;
};

// ========== HOUSE PATTERNS ==========

/**
 * Full House: All numbers on the ticket
 */
const checkFullHouse = (numbers: number[], called: number[]): boolean => {
    return numbers.every(n => called.includes(n));
};

/**
 * Half House: Half of the numbers on the ticket (rounded up)
 */
const checkHalfHouse = (numbers: number[], called: number[]): boolean => {
    const halfCount = Math.ceil(numbers.length / 2);
    const calledCount = numbers.filter(n => called.includes(n)).length;
    return calledCount >= halfCount;
};
