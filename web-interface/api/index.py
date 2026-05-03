from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.dirname(__file__))
from seating_optimizer import SeatingOptimizer, Student

app = Flask(__name__)
CORS(app)

@app.route('/api/solve', methods=['POST'])
def solve():
    data = request.json
    algorithm = data.get('algorithm')
    rows = data.get('rows')
    cols = data.get('cols')
    students_data = data.get('students')

    if not all([algorithm, rows, cols, students_data]):
        return jsonify({"error": "Missing required fields"}), 400

    students = [Student(s['id'], s['subject']) for s in students_data]
    optimizer = SeatingOptimizer(rows, cols, students)

    try:
        if algorithm == 'csp':
            hall, stats = optimizer.csp_solve()
        elif algorithm == 'backtracking':
            hall, stats = optimizer.backtracking_solve()
        elif algorithm == 'hill_climbing':
            hall, stats = optimizer.hill_climbing_solve()
        else:
            return jsonify({"error": "Unknown algorithm"}), 400
        
        return jsonify({
            "hall": hall,
            "stats": stats
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
