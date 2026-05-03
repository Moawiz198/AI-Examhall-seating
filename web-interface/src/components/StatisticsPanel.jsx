import { BarChart2, Users } from 'lucide-react';

export default function StatisticsPanel({ stats, optimizer, getSubjectColor }) {
  return (
    <aside className="panel right-panel">
      <div className="panel-title">
        <BarChart2 size={20} className="text-accent-primary" />
        Statistics & Output
      </div>
      
      <div className="stats-display">
        {stats || "Ready."}
      </div>
      
      {optimizer && (
        <>
          <div className="panel-title" style={{ fontSize: '1rem', marginTop: '1rem' }}>
            <Users size={16} /> Student List
          </div>
          <div className="student-list">
            {optimizer.students.map((student, idx) => (
              <div key={student.id} className="student-item">
                <span>{idx + 1}. {student.id}</span>
                <span style={{ color: getSubjectColor(student.subject), fontWeight: '600' }}>{student.subject}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
