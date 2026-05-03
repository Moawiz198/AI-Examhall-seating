import time
import random
from copy import deepcopy

class Student:
    def __init__(self, id, subject):
        self.id = id
        self.subject = subject

class SeatingOptimizer:
    def __init__(self, rows, cols, students):
        self.rows = rows
        self.cols = cols
        self.students = students
        self.hall = [[None for _ in range(cols)] for _ in range(rows)]

    def get_neighbors(self, row, col):
        neighbors = []
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = row + dr, col + dc
            if 0 <= nr < self.rows and 0 <= nc < self.cols:
                neighbors.append((nr, nc))
        return neighbors

    def check_constraint(self, student, row, col, hall):
        for nr, nc in self.get_neighbors(row, col):
            neighbor = hall[nr][nc]
            if neighbor and neighbor.subject == student.subject:
                return False
        return True

    def count_conflicts(self, hall):
        conflicts = 0
        for i in range(self.rows):
            for j in range(self.cols):
                if hall[i][j]:
                    student = hall[i][j]
                    for nr, nc in self.get_neighbors(i, j):
                        if hall[nr][nc] and hall[nr][nc].subject == student.subject:
                            conflicts += 1
        return conflicts // 2

    def to_dict_hall(self, hall):
        res = []
        for i in range(self.rows):
            row_res = []
            for j in range(self.cols):
                student = hall[i][j]
                if student:
                    row_res.append({"id": student.id, "subject": student.subject})
                else:
                    row_res.append(None)
            res.append(row_res)
        return res

    def csp_solve(self):
        start_time = time.time()
        result_hall = deepcopy(self.hall)
        student_copy = deepcopy(self.students)
        random.shuffle(student_copy)

        stats = {
            'algorithm': 'CSP (Constraint Propagation)',
            'conflicts': 0,
            'time': 0,
            'placements': 0,
            'constraint_checks': 0
        }

        placed = 0
        for student in student_copy:
            valid_positions = []
            for i in range(self.rows):
                for j in range(self.cols):
                    if result_hall[i][j] is None:
                        stats['constraint_checks'] += 1
                        if self.check_constraint(student, i, j, result_hall):
                            valid_positions.append((i, j))
            
            if valid_positions:
                best_pos = min(valid_positions, key=lambda p: len(self.get_neighbors(p[0], p[1])))
                result_hall[best_pos[0]][best_pos[1]] = student
                stats['placements'] += 1
                placed += 1
            else:
                placed_anywhere = False
                for i in range(self.rows):
                    for j in range(self.cols):
                        if result_hall[i][j] is None:
                            result_hall[i][j] = student
                            placed += 1
                            placed_anywhere = True
                            break
                    if placed_anywhere: break

        stats['time'] = time.time() - start_time
        stats['conflicts'] = self.count_conflicts(result_hall)
        return self.to_dict_hall(result_hall), stats

    def backtracking_solve(self, max_backtracks=15000):
        start_time = time.time()
        result_hall = deepcopy(self.hall)
        student_copy = deepcopy(self.students)
        random.shuffle(student_copy)

        stats = {
            'algorithm': 'Backtracking',
            'conflicts': 0,
            'time': 0,
            'placements': 0,
            'backtracks': 0,
            'success': False
        }

        def backtrack(student_idx):
            # Prevent hanging on difficult constraints (exponential time)
            if stats['backtracks'] >= max_backtracks:
                return False
                
            stats['placements'] += 1
            if student_idx == len(student_copy): return True

            student = student_copy[student_idx]
            for i in range(self.rows):
                for j in range(self.cols):
                    if result_hall[i][j] is None:
                        if self.check_constraint(student, i, j, result_hall):
                            result_hall[i][j] = student
                            if backtrack(student_idx + 1): return True
                            result_hall[i][j] = None
                            stats['backtracks'] += 1
            return False

        stats['success'] = backtrack(0)
        stats['time'] = time.time() - start_time
        stats['conflicts'] = self.count_conflicts(result_hall)
        return self.to_dict_hall(result_hall), stats

    def hill_climbing_solve(self, iterations=200):
        start_time = time.time()
        result_hall = deepcopy(self.hall)
        student_copy = deepcopy(self.students)
        random.shuffle(student_copy)

        idx = 0
        for i in range(self.rows):
            for j in range(self.cols):
                if idx < len(student_copy):
                    result_hall[i][j] = student_copy[idx]
                    idx += 1

        stats = {
            'algorithm': 'Hill Climbing',
            'conflicts': self.count_conflicts(result_hall),
            'time': 0,
            'iterations': 0,
            'improvements': 0
        }

        best_hall = deepcopy(result_hall)
        best_conflicts = stats['conflicts']

        for iteration in range(iterations):
            r1, c1 = random.randint(0, self.rows-1), random.randint(0, self.cols-1)
            r2, c2 = random.randint(0, self.rows-1), random.randint(0, self.cols-1)

            result_hall[r1][c1], result_hall[r2][c2] = result_hall[r2][c2], result_hall[r1][c1]
            new_conflicts = self.count_conflicts(result_hall)

            if new_conflicts < best_conflicts:
                best_conflicts = new_conflicts
                best_hall = deepcopy(result_hall)
                stats['improvements'] += 1
            else:
                if random.random() > 0.3:
                    result_hall[r1][c1], result_hall[r2][c2] = result_hall[r2][c2], result_hall[r1][c1]
            
            stats['iterations'] = iteration + 1

        stats['time'] = time.time() - start_time
        stats['conflicts'] = best_conflicts
        return self.to_dict_hall(best_hall), stats
