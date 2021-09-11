import React from 'react'

export const Edit = ({ size = 24, ...props }) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
   >
      <polygon points="16 3 21 8 8 21 3 21 3 16 16 3" />
   </svg>
)
