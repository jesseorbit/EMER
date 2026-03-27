import { LADDER_CONFIG } from '../constants';

/**
 * 사다리 가로줄 랜덤 생성
 * 인접한 가로줄이 같은 높이에 겹치지 않도록 보장
 */
export function generateLadderGrid(
  cols: number,
  rows?: number,
): boolean[][] {
  const numRows = rows ?? LADDER_CONFIG.MIN_RUNGS + Math.floor(Math.random() * 4);
  const gaps = cols - 1; // 세로줄 사이 간격 수

  const grid: boolean[][] = [];
  for (let r = 0; r < numRows; r++) {
    const row: boolean[] = [];
    for (let g = 0; g < gaps; g++) {
      const prevHas = g > 0 && row[g - 1];
      row.push(!prevHas && Math.random() > 0.4);
    }
    grid.push(row);
  }

  return grid;
}

/**
 * 사다리 경로 추적: 시작 인덱스 → 도착 인덱스
 */
export function traceLadder(grid: boolean[][], startCol: number): number {
  let pos = startCol;
  for (let r = 0; r < grid.length; r++) {
    if (pos > 0 && grid[r][pos - 1]) {
      pos--;
    } else if (pos < grid[r].length && grid[r][pos]) {
      pos++;
    }
  }
  return pos;
}

/**
 * 전체 매핑 계산
 */
export function computeMapping(grid: boolean[][], cols: number): number[] {
  return Array.from({ length: cols }, (_, i) => traceLadder(grid, i));
}
