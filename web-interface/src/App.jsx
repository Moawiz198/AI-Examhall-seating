import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { Student, SeatingOptimizer } from './optimizer';
import ConfigurationPanel from './components/ConfigurationPanel';
import VisualizationPanel from './components/VisualizationPanel';
import StatisticsPanel from './components/StatisticsPanel';

function App() {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [numStudents, setNumStudents] = useState(10);
  const [subjectsStr, setSubjectsStr] = useState('CS,SE,IT,ECE,ME');
  
  const [optimizer, setOptimizer] = useState(null);
  const [seating, setSeating] = useState(null);
  const [stats, setStats] = useState('');
  
  const generateSetup = () => {
    if (numStudents > rows * cols) {
      alert(`Students (${numStudents}) > Seats (${rows * cols})`);
      return;
    }
    
    const subjectsArr = subjectsStr.split(',').map(s => s.trim()).filter(s => s);
    if (subjectsArr.length === 0) {
      alert("Please provide at least one subject.");
      return;
    }
    
    const students = [];
    for (let i = 0; i < numStudents; i++) {
      const id = `S${(i + 1).toString().padStart(2, '0')}`;
      const subject = subjectsArr[i % subjectsArr.length];
      students.push(new Student(id, subject));
    }
    
    const newOptimizer = new SeatingOptimizer(rows, cols, students);
    setOptimizer(newOptimizer);
    setSeating(null);
    setStats("Setup ready. Click an algorithm to run.");
  };
  
  useEffect(() => {
    generateSetup();
  }, []);
  
  const getSubjectColor = (subject) => {
    const colors = {
      'CS': '#ef4444',
      'SE': '#10b981',
      'IT': '#3b82f6',
      'ECE': '#f59e0b',
      'ME': '#8b5cf6'
    };
    if (colors[subject]) return colors[subject];
    
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };
  
  const formatStats = (s) => {
    let out = `✅ Algorithm: ${s.algorithm}\n`;
    out += `⏱️  Time: ${s.time.toFixed(4)} seconds\n`;
    out += `❌ Conflicts: ${s.conflicts}\n`;
    
    if (s.success !== undefined) out += `✔️  Success: ${s.success}\n`;
    if (s.placements !== undefined) out += `📍 Placements: ${s.placements}\n`;
    if (s.backtracks !== undefined) out += `🔙 Backtracks: ${s.backtracks}\n`;
    if (s.improvements !== undefined) out += `📈 Improvements: ${s.improvements}\n`;
    if (s.iterations !== undefined) out += `🔁 Iterations: ${s.iterations}\n`;
    if (s.constraint_checks !== undefined) out += `✓ Constraint Checks: ${s.constraint_checks}\n`;
    
    return out;
  };
  
  const fetchAlgorithm = async (algorithm) => {
    if (!optimizer) return;
    setStats(`Running ${algorithm}...`);
    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: algorithm,
          rows: rows,
          cols: cols,
          students: optimizer.students
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setSeating(data.hall);
        setStats(formatStats(data.stats));
      } else {
        setStats(`Error: ${data.error}`);
      }
    } catch (err) {
      setStats(`Failed to connect to Python backend.\nMake sure Flask is running on port 5000.\nError: ${err.message}`);
    }
  };

  const runCSP = () => fetchAlgorithm('csp');
  const runBacktracking = () => fetchAlgorithm('backtracking');
  const runHillClimbing = () => fetchAlgorithm('hill_climbing');
  
  const resetAll = () => {
    setRows(5);
    setCols(5);
    setNumStudents(10);
    setSubjectsStr('CS,SE,IT,ECE,ME');
    setOptimizer(null);
    setSeating(null);
    setStats("Reset complete. Configure hall and click 'Generate Setup'.");
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-icon">
          <GraduationCap size={24} />
        </div>
        <h1>AI Exam Hall Seating Optimizer</h1>
      </header>
      
      <ConfigurationPanel 
        rows={rows} setRows={setRows}
        cols={cols} setCols={setCols}
        numStudents={numStudents} setNumStudents={setNumStudents}
        subjectsStr={subjectsStr} setSubjectsStr={setSubjectsStr}
        generateSetup={generateSetup}
        runCSP={runCSP}
        runBacktracking={runBacktracking}
        runHillClimbing={runHillClimbing}
        resetAll={resetAll}
      />
      
      <VisualizationPanel 
        rows={rows} cols={cols}
        optimizer={optimizer}
        seating={seating}
        getSubjectColor={getSubjectColor}
      />
      
      <StatisticsPanel 
        stats={stats}
        optimizer={optimizer}
        getSubjectColor={getSubjectColor}
      />
    </div>
  );
}

export default App;
