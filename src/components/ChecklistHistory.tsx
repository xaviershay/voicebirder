/**
 * Component to display list of recorded checklists
 */

import type { BirdList } from '../types';
import './ChecklistHistory.css';

interface ChecklistHistoryProps {
  lists: BirdList[];
}

export function ChecklistHistory({ lists }: ChecklistHistoryProps) {
  if (lists.length === 0) {
    return (
      <div className="checklist-history checklist-history--empty">
        <p className="checklist-history__empty-message">
          No recorded checklists yet. Start a new list to begin!
        </p>
      </div>
    );
  }

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear().toString().slice(-2);
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  return (
    <div className="checklist-history">
      <h3 className="checklist-history__title">Recent Checklists</h3>
      <div className="checklist-history__table-container">
        <table className="checklist-history__table">
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Location</th>
              <th>Species</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lists.map((list) => (
              <tr key={list.id}>
                <td>{formatDateTime(list.startDate)}</td>
                <td>
                  <span className="table-location">
                    {list.location.name}
                  </span>
                </td>
                <td className="table-center">{list.sightings.length}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-icon btn-icon--download"
                      title="Download checklist"
                      onClick={() => {
                        // TODO: Implement download functionality
                        console.log('Download checklist:', list.id);
                      }}
                    >
                      ⬇️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
