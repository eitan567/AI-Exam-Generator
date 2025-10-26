
import React from 'react';

const UserFocusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a.75.75 0 01-.75.75H18a.75.75 0 010-1.5h2.25A.75.75 0 0121 12zM12 21a.75.75 0 01-.75-.75V18a.75.75 0 011.5 0v2.25A.75.75 0 0112 21zM3 12a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm9-9a.75.75 0 01.75.75V6a.75.75 0 01-1.5 0V3.75A.75.75 0 0112 3z" />
    </svg>
);

export default UserFocusIcon;
