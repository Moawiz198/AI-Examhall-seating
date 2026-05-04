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

    # ---------- Neighbors ----------
    def get_neighbors(self, r, c):
        directions = [(-1,0),(1,0),(0,-1),(0,1)]
        res = []
        for dr, dc in directions:
            nr, nc = r+dr, c+dc
            if 0 <= nr < self.rows and 0 <= nc < self.cols:
                res.append((nr,nc))
        return res

    # ---------- Constraint ----------
    def check_constraint(self, student, r, c, hall):
        for nr, nc in self.get_neighbors(r, c):
            neighbor = hall[nr][nc]
            if neighbor and neighbor.subject == student.subject:
                return False
        return True

    # ---------- Conflict Count ----------
    def count_conflicts(self, hall):
        conflicts = 0
        for i in range(self.rows):
            for j in range(self.cols):
                if hall[i][j]:
                    s = hall[i][j]
                    for ni, nj in self.get_neighbors(i, j):
                        if hall[ni][nj] and hall[ni][nj].subject == s.subject:
                            conflicts += 1
        return conflicts // 2

    # ---------- Convert ----------
    def to_dict(self, hall):
        return [
            [
                None if cell is None else {"id": cell.id, "subject": cell.subject}
                for cell in row
            ]
            for row in hall
        ]

    # ================= CSP =================
    def csp_solve(self):
        start = time.time()
        hall = deepcopy(self.hall)
        students = deepcopy(self.students)
        random.shuffle(students)

        stats = {
            "algorithm": "CSP (Greedy Constraint Placement)",
            "placements": 0,
            "conflicts": 0,
            "time": 0
        }

        for student in students:
            valid = []

            for i in range(self.rows):
                for j in range(self.cols):
                    if hall[i][j] is None:
                        if self.check_constraint(student, i, j, hall):
                            valid.append((i, j))

            if valid:
                r, c = random.choice(valid)
                hall[r][c] = student
                stats["placements"] += 1
            else:
                # fallback placement
                for i in range(self.rows):
                    placed = False
                    for j in range(self.cols):
                        if hall[i][j] is None:
                            hall[i][j] = student
                            placed = True
                            break
                    if placed:
                        break

        stats["conflicts"] = self.count_conflicts(hall)
        stats["time"] = time.time() - start
        return self.to_dict(hall), stats

    # ================= BACKTRACKING =================
    def backtracking_solve(self, max_backtracks=5000):
        start = time.time()
        hall = deepcopy(self.hall)
        students = deepcopy(self.students)

        stats = {
            "algorithm": "Backtracking",
            "backtracks": 0,
            "placements": 0,
            "conflicts": 0,
            "success": False,
            "time": 0
        }

        def solve(i):
            if i == len(students):
                return True

            if stats["backtracks"] > max_backtracks:
                return False

            student = students[i]

            for r in range(self.rows):
                for c in range(self.cols):
                    if hall[r][c] is None:
                        if self.check_constraint(student, r, c, hall):
                            hall[r][c] = student
                            stats["placements"] += 1

                            if solve(i + 1):
                                return True

                            hall[r][c] = None
                            stats["backtracks"] += 1

            return False

        stats["success"] = solve(0)
        stats["conflicts"] = self.count_conflicts(hall)
        stats["time"] = time.time() - start

        return self.to_dict(hall), stats

    # ================= HILL CLIMBING =================
    def hill_climbing_solve(self, iterations=300):
        start = time.time()
        students = deepcopy(self.students)
        random.shuffle(students)

        hall = [[None for _ in range(self.cols)] for _ in range(self.rows)]

        k = 0
        for i in range(self.rows):
            for j in range(self.cols):
                if k < len(students):
                    hall[i][j] = students[k]
                    k += 1

        def get_conf():
            return self.count_conflicts(hall)

        best_conf = get_conf()

        stats = {
            "algorithm": "Hill Climbing",
            "iterations": 0,
            "conflicts": best_conf,
            "improvements": 0,
            "time": 0
        }

        for it in range(iterations):
            r1, c1 = random.randint(0, self.rows-1), random.randint(0, self.cols-1)
            r2, c2 = random.randint(0, self.rows-1), random.randint(0, self.cols-1)

            hall[r1][c1], hall[r2][c2] = hall[r2][c2], hall[r1][c1]

            new_conf = get_conf()

            if new_conf < best_conf:
                best_conf = new_conf
                stats["improvements"] += 1
            else:
                # revert swap
                hall[r1][c1], hall[r2][c2] = hall[r2][c2], hall[r1][c1]

            stats["iterations"] = it + 1

        stats["conflicts"] = best_conf
        stats["time"] = time.time() - start

        return self.to_dict(hall), stats