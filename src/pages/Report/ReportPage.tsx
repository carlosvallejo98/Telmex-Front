// src/pages/Report/ReportPage.tsx
import React from 'react';
import ReportView, { ReportViewTicket } from './ReportView';

interface ReportPageProps {
  ticket: ReportViewTicket;
  onBack: () => void;
  onOk: () => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ ticket, onBack, onOk }) => {
  return (
    <div style={{ padding: 24 }}>
      <ReportView
        ticket={ticket}
        onCancel={onBack}
        onCloseSuccess={onOk}
      />
    </div>
  );
};

export default ReportPage;
