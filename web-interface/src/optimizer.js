class Student {
  constructor(id, subject) {
    this.id = id;
    this.subject = subject;
  }
}

class SeatingOptimizer {
  constructor(rows, cols, students) {
    this.rows = rows;
    this.cols = cols;
    this.students = students;
    this.total_seats = rows * cols;
    
    this.hall = Array(rows).fill(null).map(() => Array(cols).fill(null));
  }
  
  getNeighbors(row, col) {
    const neighbors = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (let [dr, dc] of dirs) {
      let nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
        neighbors.push([nr, nc]);
      }
    }
    return neighbors;
  }
  
  checkConstraint(student, row, col, hall) {
    const neighbors = this.getNeighbors(row, col);
    for (let [nr, nc] of neighbors) {
      const neighborStudent = hall[nr][nc];
      if (neighborStudent && neighborStudent.subject === student.subject) {
        return false;
      }
    }
    return true;
  }
  
  countConflicts(hall) {
    let conflicts = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (hall[i][j]) {
          const student = hall[i][j];
          const neighbors = this.getNeighbors(i, j);
          for (let [nr, nc] of neighbors) {
            if (hall[nr][nc] && hall[nr][nc].subject === student.subject) {
              conflicts++;
            }
          }
        }
      }
    }
    return Math.floor(conflicts / 2);
  }
  
  cspSolve() {
    const startTime = performance.now();
    let resultHall = this.hall.map(row => [...row]);
    let studentCopy = [...this.students];
    
    for (let i = studentCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [studentCopy[i], studentCopy[j]] = [studentCopy[j], studentCopy[i]];
    }
    
    let stats = {
      algorithm: 'CSP (Constraint Propagation)',
      conflicts: 0,
      time: 0,
      placements: 0,
      constraint_checks: 0
    };
    
    let placed = 0;
    
    for (let student of studentCopy) {
      let validPositions = [];
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          if (resultHall[i][j] === null) {
            stats.constraint_checks++;
            if (this.checkConstraint(student, i, j, resultHall)) {
              validPositions.push([i, j]);
            }
          }
        }
      }
      
      if (validPositions.length > 0) {
        let bestPos = validPositions.reduce((min, p) => {
          return this.getNeighbors(p[0], p[1]).length < this.getNeighbors(min[0], min[1]).length ? p : min;
        });
        resultHall[bestPos[0]][bestPos[1]] = student;
        stats.placements++;
        placed++;
      } else {
        let placedAnywhere = false;
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.cols; j++) {
            if (resultHall[i][j] === null) {
              resultHall[i][j] = student;
              placed++;
              placedAnywhere = true;
              break;
            }
          }
          if (placedAnywhere) break;
        }
      }
    }
    
    stats.time = (performance.now() - startTime) / 1000;
    stats.conflicts = this.countConflicts(resultHall);
    
    return { resultHall, stats };
  }
  
  backtrackingSolve() {
    const startTime = performance.now();
    let resultHall = this.hall.map(row => [...row]);
    let studentCopy = [...this.students];
    
    for (let i = studentCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [studentCopy[i], studentCopy[j]] = [studentCopy[j], studentCopy[i]];
    }
    
    let stats = {
      algorithm: 'Backtracking',
      conflicts: 0,
      time: 0,
      placements: 0,
      backtracks: 0,
      success: false
    };
    
    const backtrack = (studentIdx) => {
      stats.placements++;
      if (studentIdx === studentCopy.length) return true;
      
      let student = studentCopy[studentIdx];
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          if (resultHall[i][j] === null) {
            if (this.checkConstraint(student, i, j, resultHall)) {
              resultHall[i][j] = student;
              if (backtrack(studentIdx + 1)) return true;
              resultHall[i][j] = null;
              stats.backtracks++;
            }
          }
        }
      }
      return false;
    };
    
    stats.success = backtrack(0);
    stats.time = (performance.now() - startTime) / 1000;
    stats.conflicts = this.countConflicts(resultHall);
    
    return { resultHall, stats };
  }
  
  hillClimbingSolve(iterations = 200) {
    const startTime = performance.now();
    let resultHall = this.hall.map(row => [...row]);
    let studentCopy = [...this.students];
    
    for (let i = studentCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [studentCopy[i], studentCopy[j]] = [studentCopy[j], studentCopy[i]];
    }
    
    let idx = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (idx < studentCopy.length) {
          resultHall[i][j] = studentCopy[idx];
          idx++;
        }
      }
    }
    
    let stats = {
      algorithm: 'Hill Climbing',
      conflicts: this.countConflicts(resultHall),
      time: 0,
      iterations: 0,
      improvements: 0
    };
    
    let bestHall = resultHall.map(row => [...row]);
    let bestConflicts = stats.conflicts;
    
    for (let iteration = 0; iteration < iterations; iteration++) {
      let r1 = Math.floor(Math.random() * this.rows);
      let c1 = Math.floor(Math.random() * this.cols);
      let r2 = Math.floor(Math.random() * this.rows);
      let c2 = Math.floor(Math.random() * this.cols);
      
      let temp = resultHall[r1][c1];
      resultHall[r1][c1] = resultHall[r2][c2];
      resultHall[r2][c2] = temp;
      
      let newConflicts = this.countConflicts(resultHall);
      
      if (newConflicts < bestConflicts) {
        bestConflicts = newConflicts;
        bestHall = resultHall.map(row => [...row]);
        stats.improvements++;
      } else {
        if (Math.random() > 0.3) {
          let t = resultHall[r1][c1];
          resultHall[r1][c1] = resultHall[r2][c2];
          resultHall[r2][c2] = t;
        }
      }
      stats.iterations = iteration + 1;
    }
    
    stats.time = (performance.now() - startTime) / 1000;
    stats.conflicts = bestConflicts;
    
    return { resultHall: bestHall, stats };
  }
}

export { Student, SeatingOptimizer };
