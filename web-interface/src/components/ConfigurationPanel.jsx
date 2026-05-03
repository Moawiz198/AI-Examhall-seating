import { Settings, Grid3X3, Users, RefreshCw, Zap } from 'lucide-react';

export default function ConfigurationPanel({
  rows, setRows, cols, setCols, numStudents, setNumStudents, subjectsStr, setSubjectsStr,
  generateSetup, runCSP, runBacktracking, runHillClimbing, resetAll
}) {
  return (
    <aside className="panel left-panel">
      <div className="panel-title">
        <Settings size={20} className="text-accent-primary" />
        Configuration
      </div>
      
      <div className="form-group">
        <div className="panel-title" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
          <Grid3X3 size={16} /> Hall Dimensions
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Rows</label>
            <input type="number" min="3" max="20" value={rows} onChange={(e) => setRows(Number(e.target.value))} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Columns</label>
            <input type="number" min="3" max="20" value={cols} onChange={(e) => setCols(Number(e.target.value))} className="form-input" />
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <div className="panel-title" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
          <Users size={16} /> Students
        </div>
        <div className="form-group">
          <label className="form-label">Number of Students</label>
          <input type="number" min="1" max="400" value={numStudents} onChange={(e) => setNumStudents(Number(e.target.value))} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Subjects (comma-separated)</label>
          <input type="text" value={subjectsStr} onChange={(e) => setSubjectsStr(e.target.value)} className="form-input" />
        </div>
      </div>
      
      <button className="btn btn-primary" onClick={generateSetup}>
        <RefreshCw size={18} /> Generate Setup
      </button>
      
      <div className="panel-title" style={{ fontSize: '1rem', marginTop: '1rem' }}>
        <Zap size={16} /> Algorithms
      </div>
      <button className="btn btn-secondary" onClick={runCSP}>⚙️ CSP Solver</button>
      <button className="btn btn-secondary" onClick={runBacktracking}>🔙 Backtracking</button>
      <button className="btn btn-secondary" onClick={runHillClimbing}>⛰️ Hill Climbing</button>
      
      <button className="btn btn-danger" onClick={resetAll} style={{ marginTop: 'auto' }}>
        🗑️ Reset All
      </button>
    </aside>
  );
}
