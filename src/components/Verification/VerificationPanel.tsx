import React from 'react';
import { useVerification } from '../../hooks/useVerification';

/**
 * V137: VerificationPanel — shows invariant results and certification status
 */
interface Props {
  skillId: string;
  version: string;
  genome: Record<string, unknown>;
}

export function VerificationPanel({ skillId, version, genome }: Props) {
  const { report, running, runVerification } = useVerification();

  const handleRun = async () => {
    await runVerification(skillId, version, genome as any);
  };

  return (
    <div className="verification-panel">
      <div className="verification-header">
        <h4>Skill Verification</h4>
        <button onClick={handleRun} disabled={running}>
          {running ? 'Running...' : 'Run All Invariants'}
        </button>
      </div>
      {report && (
        <div className="verification-results">
          <div className={`overall-score ${report.overallPassed ? 'passed' : 'failed'}`}>
            Overall: {report.overallScore} · {report.overallPassed ? 'Certified ✅' : 'Not Certified ❌'}
          </div>
          <table className="invariant-table">
            <thead>
              <tr>
                <th>ID</th><th>Category</th><th>Severity</th><th>Result</th><th>Score</th>
              </tr>
            </thead>
            <tbody>
              {report.results.map(r => (
                <tr key={r.invariantId}>
                  <td>{r.invariantId}</td>
                  <td>{r.invariantId.split('_')[1]}</td>
                  <td>{r.invariantId.includes('safety') ? 'critical' : 'info'}</td>
                  <td>{r.passed ? '✅' : '❌'}</td>
                  <td>{r.score.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}