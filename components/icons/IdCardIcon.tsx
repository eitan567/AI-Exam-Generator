import React from 'react';

const IdCardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h.008v.008H8.25V9.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12a2.25 2.25 0 10-4.5 0 2.25 2.25 0 004.5 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 16.5c.623 0 1.235.253 1.68.699a2.25 2.25 0 013.14 0c.445-.446 1.057-.699 1.68-.699" />
    </svg>
);

export default IdCardIcon;