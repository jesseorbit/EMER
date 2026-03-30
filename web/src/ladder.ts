export interface Point {
  x: number;
  y: number;
}

/**
 * 공정한 사다리 그리드 생성
 * grid[row][gap] = true이면 col[gap]과 col[gap+1] 사이에 가로줄 존재
 * 인접한 가로줄이 같은 높이에 겹치지 않도록 보장
 */
export function generateGrid(numCols: number, numRows: number): boolean[][] {
  const gaps = numCols - 1;
  const grid: boolean[][] = [];

  for (let r = 0; r < numRows; r++) {
    const row: boolean[] = [];
    for (let g = 0; g < gaps; g++) {
      const prevHas = g > 0 && row[g - 1];
      row.push(!prevHas && Math.random() > 0.45);
    }
    grid.push(row);
  }

  // 최소 1개의 가로줄은 있어야 함 (빈 사다리 방지)
  const hasAnyRung = grid.some((row) => row.some(Boolean));
  if (!hasAnyRung) {
    const randomRow = Math.floor(Math.random() * numRows);
    const randomGap = Math.floor(Math.random() * gaps);
    grid[randomRow][randomGap] = true;
  }

  return grid;
}

/**
 * 한 참가자의 사다리 경로를 추적하여 좌표 배열 반환
 */
export function tracePath(
  startCol: number,
  grid: boolean[][],
  colXs: number[],
  rowYs: number[],
  startY: number,
  endY: number,
): { points: Point[]; endCol: number } {
  const points: Point[] = [];
  let col = startCol;

  points.push({ x: colXs[col], y: startY });

  for (let r = 0; r < grid.length; r++) {
    const y = rowYs[r];

    // 가로줄 높이까지 내려감
    points.push({ x: colXs[col], y });

    // 왼쪽 가로줄 확인
    if (col > 0 && grid[r][col - 1]) {
      col--;
      points.push({ x: colXs[col], y });
    }
    // 오른쪽 가로줄 확인
    else if (col < grid[r].length && grid[r][col]) {
      col++;
      points.push({ x: colXs[col], y });
    }
  }

  // 바닥까지 내려감
  points.push({ x: colXs[col], y: endY });

  return { points, endCol: col };
}

/**
 * Point 배열을 SVG path d 문자열로 변환
 */
export function pointsToPathD(points: Point[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

/**
 * 전체 참가자의 경로와 매핑을 계산
 */
export function computeAllPaths(
  numCols: number,
  grid: boolean[][],
  colXs: number[],
  rowYs: number[],
  startY: number,
  endY: number,
): { pathDs: string[]; mapping: number[] } {
  const pathDs: string[] = [];
  const mapping: number[] = [];

  for (let i = 0; i < numCols; i++) {
    const { points, endCol } = tracePath(i, grid, colXs, rowYs, startY, endY);
    pathDs.push(pointsToPathD(points));
    mapping.push(endCol);
  }

  return { pathDs, mapping };
}

/** 고정 SVG viewBox 크기 */
export const SVG_W = 600;
export const SVG_H = 520;

export function computeLayout(numCols: number, numRows: number) {
  const paddingX = numCols <= 4 ? 60 : 40;
  const topArea = 70;
  const bottomArea = 70;
  const ladderTop = topArea;
  const ladderBottom = SVG_H - bottomArea;

  const colSpacing = numCols > 1 ? (SVG_W - paddingX * 2) / (numCols - 1) : 0;
  const colXs = Array.from({ length: numCols }, (_, i) => paddingX + i * colSpacing);

  const rowSpacing = (ladderBottom - ladderTop) / (numRows + 1);
  const rowYs = Array.from({ length: numRows }, (_, i) => ladderTop + (i + 1) * rowSpacing);

  // 뱃지 폭: 칸 간격의 85%, 최대 100px, 최소 50px
  const badgeWidth = Math.max(Math.min(colSpacing * 0.85, 100), 50);

  return { colXs, rowYs, ladderTop, ladderBottom, paddingX, colSpacing, badgeWidth };
}
