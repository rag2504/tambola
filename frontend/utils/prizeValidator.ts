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

        // ========== EXTRA / CUSTOM ==========
        case 'x1': // First 3 Numbers
            return checkFirst3Numbers(numbers, calledNumbers);

        case 'x2': // Any 2 Lines
            return checkAny2Lines(grid, calledNumbers);

        case 'x3': // Center Box
            return checkCenterBox(grid, calledNumbers);

        case 'x4': // X Pattern
            return checkXPattern(grid, calledNumbers);

        case 'x5': // Pyramid
            return checkPyramid(grid, calledNumbers);

        // ========== LETTERS / WORDS ==========
        case 'l1': // L Shape
            return checkLShape(grid, calledNumbers);

        case 'l2': // T Shape
            return checkTShape(grid, calledNumbers);

        case 'l3': // H Shape
            return checkHShape(grid, calledNumbers);

        case 'l4': // Z Shape
            return checkZShape(grid, calledNumbers);

        // ========== MATH ==========
        case 'm1': // Even Numbers Complete
            return checkEvenNumbers(numbers, calledNumbers);

        case 'm2': // Odd Numbers Complete
            return checkOddNumbers(numbers, calledNumbers);

        case 'm3': // Sum Equals 50
            return checkSumEquals(numbers, calledNumbers, 50);

        case 'm4': // Multiples of 5
            return checkMultiplesOf5(numbers, calledNumbers);

        case 'm5': // Prime Numbers
            return checkPrimeNumbers(numbers, calledNumbers);

        // ========== MIN-MAX / TEMPERATURE / BP ==========
        case 'n1': // Smallest Number
            return checkSmallestNumber(numbers, calledNumbers);

        case 'n2': // Largest Number
            return checkLargestNumber(numbers, calledNumbers);

        case 'n3': // Range 30-60
            return checkRange(numbers, calledNumbers, 30, 60);

        case 'n4': // Blood Pressure (120/80)
            return checkBloodPressure(numbers, calledNumbers);

        // ========== START / END ==========
        case 's1': // Starts with 1
            return checkStartsWith(numbers, calledNumbers, 1);

        case 's2': // Starts with 2
            return checkStartsWith(numbers, calledNumbers, 2);

        case 's3': // Starts with 3
            return checkStartsWith(numbers, calledNumbers, 3);

        case 's4': // Ends with 0
            return checkEndsWith(numbers, calledNumbers, 0);

        case 's5': // Ends with 5
            return checkEndsWith(numbers, calledNumbers, 5);

        // ========== PAIRS ==========
        case 'p1': // Any Pair
            return checkAnyPair(numbers, calledNumbers);

        case 'p2': // Same Ending Pair
            return checkSameEndingPair(numbers, calledNumbers);

        case 'p3': // Couple Pair
            return checkCouplePair(numbers, calledNumbers);

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

        // ========== SPECIAL NUMBERS ==========
        case 't1': // First Number Called
            return checkFirstCalled(numbers, calledNumbers);

        case 't2': // Last Number Called
            return checkLastCalled(numbers, calledNumbers);

        case 't3': // Lucky 7
            return checkLuckyNumber(numbers, calledNumbers, 7);

        case 't4': // Double Numbers
            return checkDoubleNumbers(numbers, calledNumbers);

        // ========== HOUSE ==========
        case 'h1': // Full House
        case 'fullhouse':
            return checkFullHouse(numbers, calledNumbers);

        case 'h2': // Half House
            return checkHalfHouse(numbers, calledNumbers);

        default:
            // Check if it's a custom claim
            if (prizeType.startsWith('custom_')) {
                // Custom claims need pattern data passed separately
                // This will be handled by a wrapper function
                return false;
            }
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

// ========== EXTRA / CUSTOM PATTERNS ==========

/**
 * First 3 Numbers: First 3 numbers of the ticket marked
 */
const checkFirst3Numbers = (numbers: number[], called: number[]): boolean => {
    return numbers.slice(0, 3).every(n => called.includes(n));
};

/**
 * Any 2 Lines: Any two complete rows
 */
const checkAny2Lines = (grid: (number | null)[][], called: number[]): boolean => {
    return check2Lines(grid, called);
};

/**
 * Center Box: 3x3 center area of the ticket
 * For a 3x9 grid, center box is the middle 3 columns of all 3 rows
 */
const checkCenterBox = (grid: (number | null)[][], called: number[]): boolean => {
    const centerNums: (number | null)[] = [];
    // Get center 3 columns (indices 3, 4, 5) from all rows
    for (let row = 0; row < 3; row++) {
        centerNums.push(grid[row][3], grid[row][4], grid[row][5]);
    }
    return allCalled(centerNums, called);
};

/**
 * X Pattern: Diagonal cross pattern
 */
const checkXPattern = (grid: (number | null)[][], called: number[]): boolean => {
    // Get all numbers in both diagonals
    const xNums: (number | null)[] = [];

    // Top-left to bottom-right diagonal
    for (let i = 0; i < 9; i++) {
        const row = Math.floor(i / 3);
        xNums.push(grid[row][i]);
    }

    // Top-right to bottom-left diagonal
    for (let i = 0; i < 9; i++) {
        const row = Math.floor(i / 3);
        const col = 8 - i;
        xNums.push(grid[row][col]);
    }

    return allCalled(xNums, called);
};

/**
 * Pyramid: Pyramid shape pattern
 * Top row: 1 number (center), Middle: 3 numbers, Bottom: 5 numbers
 */
const checkPyramid = (grid: (number | null)[][], called: number[]): boolean => {
    const pyramidNums: (number | null)[] = [];

    // Top row center
    pyramidNums.push(getCenterInRow(grid[0]));

    // Middle row - get 3 center numbers
    const middleNonNull = grid[1].filter(n => n !== null);
    const middleStart = Math.floor((middleNonNull.length - 3) / 2);
    pyramidNums.push(...middleNonNull.slice(middleStart, middleStart + 3));

    // Bottom row - all 5 numbers
    pyramidNums.push(...grid[2].filter(n => n !== null));

    return allCalled(pyramidNums, called);
};

// ========== LETTER / WORD PATTERNS ==========

/**
 * L Shape: Left column + bottom row
 */
const checkLShape = (grid: (number | null)[][], called: number[]): boolean => {
    const lNums: (number | null)[] = [];

    // Left column (first number of each row)
    lNums.push(getFirstInRow(grid[0]));
    lNums.push(getFirstInRow(grid[1]));
    lNums.push(getFirstInRow(grid[2]));

    // Bottom row (all numbers)
    lNums.push(...grid[2]);

    return allCalled(lNums, called);
};

/**
 * T Shape: Top row + middle column
 */
const checkTShape = (grid: (number | null)[][], called: number[]): boolean => {
    const tNums: (number | null)[] = [];

    // Top row (all numbers)
    tNums.push(...grid[0]);

    // Middle column (center of each row)
    tNums.push(getCenterInRow(grid[0]));
    tNums.push(getCenterInRow(grid[1]));
    tNums.push(getCenterInRow(grid[2]));

    return allCalled(tNums, called);
};

/**
 * H Shape: Left column + middle row + right column
 */
const checkHShape = (grid: (number | null)[][], called: number[]): boolean => {
    const hNums: (number | null)[] = [];

    // Left column
    hNums.push(getFirstInRow(grid[0]));
    hNums.push(getFirstInRow(grid[1]));
    hNums.push(getFirstInRow(grid[2]));

    // Middle row
    hNums.push(...grid[1]);

    // Right column
    hNums.push(getLastInRow(grid[0]));
    hNums.push(getLastInRow(grid[1]));
    hNums.push(getLastInRow(grid[2]));

    return allCalled(hNums, called);
};

/**
 * Z Shape: Top row + diagonal + bottom row
 */
const checkZShape = (grid: (number | null)[][], called: number[]): boolean => {
    const zNums: (number | null)[] = [];

    // Top row
    zNums.push(...grid[0]);

    // Diagonal (top-right to bottom-left)
    zNums.push(getLastInRow(grid[0]));
    zNums.push(getCenterInRow(grid[1]));
    zNums.push(getFirstInRow(grid[2]));

    // Bottom row
    zNums.push(...grid[2]);

    return allCalled(zNums, called);
};

// ========== MATH PATTERNS ==========

/**
 * Even Numbers Complete: All even numbers on ticket marked
 */
const checkEvenNumbers = (numbers: number[], called: number[]): boolean => {
    const evenNums = numbers.filter(n => n % 2 === 0);
    return evenNums.length > 0 && evenNums.every(n => called.includes(n));
};

/**
 * Odd Numbers Complete: All odd numbers on ticket marked
 */
const checkOddNumbers = (numbers: number[], called: number[]): boolean => {
    const oddNums = numbers.filter(n => n % 2 !== 0);
    return oddNums.length > 0 && oddNums.every(n => called.includes(n));
};

/**
 * Sum Equals: Sum of marked numbers equals target
 */
const checkSumEquals = (numbers: number[], called: number[], target: number): boolean => {
    const markedNums = numbers.filter(n => called.includes(n));
    const sum = markedNums.reduce((acc, n) => acc + n, 0);
    return sum === target;
};

/**
 * Multiples of 5: All multiples of 5 on ticket marked
 */
const checkMultiplesOf5 = (numbers: number[], called: number[]): boolean => {
    const multiplesOf5 = numbers.filter(n => n % 5 === 0);
    return multiplesOf5.length > 0 && multiplesOf5.every(n => called.includes(n));
};

/**
 * Prime Numbers: All prime numbers on ticket marked
 */
const checkPrimeNumbers = (numbers: number[], called: number[]): boolean => {
    const isPrime = (num: number): boolean => {
        if (num < 2) return false;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) return false;
        }
        return true;
    };

    const primes = numbers.filter(n => isPrime(n));
    return primes.length > 0 && primes.every(n => called.includes(n));
};

// ========== MIN-MAX / TEMPERATURE / BP PATTERNS ==========

/**
 * Smallest Number: Smallest number on ticket is marked
 */
const checkSmallestNumber = (numbers: number[], called: number[]): boolean => {
    const smallest = Math.min(...numbers);
    return called.includes(smallest);
};

/**
 * Largest Number: Largest number on ticket is marked
 */
const checkLargestNumber = (numbers: number[], called: number[]): boolean => {
    const largest = Math.max(...numbers);
    return called.includes(largest);
};

/**
 * Range: All numbers in specified range are marked
 */
const checkRange = (numbers: number[], called: number[], min: number, max: number): boolean => {
    const inRange = numbers.filter(n => n >= min && n <= max);
    return inRange.length > 0 && inRange.every(n => called.includes(n));
};

/**
 * Blood Pressure: Specific pair like 120 & 80 both marked
 */
const checkBloodPressure = (numbers: number[], called: number[]): boolean => {
    // Check if ticket has both numbers in the BP pair
    const has120 = numbers.includes(120) || numbers.includes(12);
    const has80 = numbers.includes(80) || numbers.includes(8);

    if (!has120 || !has80) return false;

    // Check if both are called
    const called120 = called.includes(120) || called.includes(12);
    const called80 = called.includes(80) || called.includes(8);

    return called120 && called80;
};

// ========== START / END PATTERNS ==========

/**
 * Starts With: All numbers starting with specified digit are marked
 */
const checkStartsWith = (numbers: number[], called: number[], digit: number): boolean => {
    const startsWith = numbers.filter(n => {
        const firstDigit = parseInt(String(n)[0]);
        return firstDigit === digit;
    });
    return startsWith.length > 0 && startsWith.every(n => called.includes(n));
};

/**
 * Ends With: All numbers ending with specified digit are marked
 */
const checkEndsWith = (numbers: number[], called: number[], digit: number): boolean => {
    const endsWith = numbers.filter(n => n % 10 === digit);
    return endsWith.length > 0 && endsWith.every(n => called.includes(n));
};

// ========== PAIR PATTERNS ==========

/**
 * Any Pair: Any 2 numbers marked
 */
const checkAnyPair = (numbers: number[], called: number[]): boolean => {
    const markedCount = numbers.filter(n => called.includes(n)).length;
    return markedCount >= 2;
};

/**
 * Same Ending Pair: Two numbers with same last digit marked
 */
const checkSameEndingPair = (numbers: number[], called: number[]): boolean => {
    const markedNums = numbers.filter(n => called.includes(n));

    // Check if any two marked numbers have same ending
    for (let i = 0; i < markedNums.length; i++) {
        for (let j = i + 1; j < markedNums.length; j++) {
            if (markedNums[i] % 10 === markedNums[j] % 10) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Couple Pair: Specific couple pairs like (1,9), (2,8), (3,7), etc.
 */
const checkCouplePair = (numbers: number[], called: number[]): boolean => {
    const couplePairs = [
        [1, 9], [2, 8], [3, 7], [4, 6], [5, 5],
        [10, 90], [20, 80], [30, 70], [40, 60], [50, 50],
        [11, 19], [12, 18], [13, 17], [14, 16], [15, 15]
    ];

    for (const [a, b] of couplePairs) {
        if (numbers.includes(a) && numbers.includes(b) &&
            called.includes(a) && called.includes(b)) {
            return true;
        }
    }
    return false;
};

// ========== SPECIAL NUMBER PATTERNS ==========

/**
 * First Number Called: First called number is on ticket and marked
 */
const checkFirstCalled = (numbers: number[], called: number[]): boolean => {
    if (called.length === 0) return false;
    const firstCalled = called[0];
    return numbers.includes(firstCalled);
};

/**
 * Last Number Called: Most recently called number is on ticket
 */
const checkLastCalled = (numbers: number[], called: number[]): boolean => {
    if (called.length === 0) return false;
    const lastCalled = called[called.length - 1];
    return numbers.includes(lastCalled);
};

/**
 * Lucky Number: Specific lucky number is on ticket and marked
 */
const checkLuckyNumber = (numbers: number[], called: number[], luckyNum: number): boolean => {
    return numbers.includes(luckyNum) && called.includes(luckyNum);
};

/**
 * Double Numbers: All double numbers (11, 22, 33, ..., 88) on ticket marked
 */
const checkDoubleNumbers = (numbers: number[], called: number[]): boolean => {
    const doubles = [11, 22, 33, 44, 55, 66, 77, 88];
    const ticketDoubles = numbers.filter(n => doubles.includes(n));
    return ticketDoubles.length > 0 && ticketDoubles.every(n => called.includes(n));
};

// ========== CUSTOM PATTERN ==========

/**
 * Check Custom Pattern: Validates user-defined custom patterns
 * @param grid - The ticket grid
 * @param pattern - Array of cell positions in format "row-col" (e.g., ["0-0", "1-4", "2-8"])
 * @param called - Called numbers
 */
export const checkCustomPattern = (
    grid: (number | null)[][],
    pattern: string[],
    called: number[]
): boolean => {
    if (!pattern || pattern.length === 0) return false;

    const patternNumbers: (number | null)[] = [];

    // Extract numbers from the pattern cells
    for (const cellKey of pattern) {
        const [rowStr, colStr] = cellKey.split('-');
        const row = parseInt(rowStr);
        const col = parseInt(colStr);

        if (row >= 0 && row < 3 && col >= 0 && col < 9) {
            patternNumbers.push(grid[row][col]);
        }
    }

    // Check if all pattern numbers are called
    return allCalled(patternNumbers, called);
};



/**
 * Verify a player's claim for a specific prize
 * @param playerId - The player making the claim
 * @param prizeId - The prize being claimed
 * @param tickets - All tickets in the game
 * @param calledNumbers - Numbers that have been called
 * @returns Verification result with ticket ID if valid
 */
export const verifyPlayerClaim = (
    playerId: string,
    prizeId: string,
    tickets: Ticket[],
    calledNumbers: number[]
): { valid: boolean; ticketId?: string; ticketNumber?: number; message: string } => {
    // Get all tickets for this player
    const playerTickets = tickets.filter(t => t.player_id === playerId);

    if (playerTickets.length === 0) {
        return {
            valid: false,
            message: 'No tickets found for this player'
        };
    }

    // Check each ticket to see if any wins this prize
    for (const ticket of playerTickets) {
        const wins = checkPrizeWin(ticket, prizeId, calledNumbers);
        if (wins) {
            return {
                valid: true,
                ticketId: ticket.id,
                ticketNumber: ticket.ticket_number,
                message: `Valid claim! Ticket #${ticket.ticket_number} wins this prize.`
            };
        }
    }

    return {
        valid: false,
        message: 'None of your tickets match this prize pattern yet. Keep playing!'
    };
};
