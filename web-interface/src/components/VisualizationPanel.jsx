import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3 } from 'lucide-react';

export default function VisualizationPanel({ rows, cols, optimizer, seating, getSubjectColor }) {
  return (
    <main className="panel center-panel" style={{ padding: '0', overflow: 'hidden' }}>
      <div className="panel-title" style={{ padding: '1.5rem 1.5rem 0' }}>
        <Grid3X3 size={20} className="text-accent-primary" />
        Seating Arrangement
      </div>
      <div className="grid-container">
        {optimizer && (
          <div className="hall-grid" style={{ gridTemplateRows: `repeat(${rows}, max-content)`, gridTemplateColumns: `repeat(${cols}, max-content)` }}>
            <AnimatePresence>
              {Array.from({ length: rows }).map((_, i) => 
                Array.from({ length: cols }).map((_, j) => {
                  const student = seating ? seating[i][j] : null;
                  return (
                    <motion.div
                      key={`${i}-${j}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: (i * cols + j) * 0.01 }}
                      className={`seat ${student ? 'filled' : 'empty'}`}
                      style={{
                        backgroundColor: student ? getSubjectColor(student.subject) : '',
                      }}
                    >
                      {student && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex flex-col items-center justify-center h-full w-full"
                        >
                          <span className="seat-id">{student.id}</span>
                          <span className="seat-subject">{student.subject}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
