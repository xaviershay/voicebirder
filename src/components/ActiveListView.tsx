/**
 * Active list view showing current birding session
 */

import { format } from 'date-fns';
import type { BirdList } from '../types';
import './ActiveListView.css';

interface ActiveListViewProps {
  list: BirdList;
  onComplete: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function ActiveListView({ list, onComplete, onCancel, children }: ActiveListViewProps) {
  const duration = Math.floor((new Date().getTime() - list.startDate.getTime()) / 60000);

  return (
    <div className="active-list">
      <div className="list-header">
        <div className="list-header__info">
          <h2 className="list-header__location">{list.location.name}</h2>
          <div className="list-header__meta">
            <span className="meta-item">
              {format(list.startDate, 'MMM d, yyyy • h:mm a')}
            </span>
            <span className="meta-item meta-item--separator">•</span>
            <span className="meta-item">{list.protocol}</span>
            <span className="meta-item meta-item--separator">•</span>
            <span className="meta-item">{duration} min</span>
          </div>
        </div>
        <div className="list-header__actions">
          <button className="btn btn--secondary btn--small" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn--primary btn--small" onClick={onComplete}>
            Complete List
          </button>
        </div>
      </div>

      <div className="list-content">
        {children}
      </div>
    </div>
  );
}
