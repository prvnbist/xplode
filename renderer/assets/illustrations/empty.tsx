import React from 'react'

export const Empty = ({ size = '240' }) => {
   return (
      <svg
         width={size}
         height={size}
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 400 425"
      >
         <g clipPath="url(#clip0)">
            <rect
               x="12.304"
               y="120.578"
               width="252"
               height="325"
               rx="14"
               transform="rotate(-19.921 12.304 120.578)"
               fill="#233446"
            />
            <rect
               x="27.416"
               y="129.993"
               width="230"
               height="297"
               rx="14"
               transform="rotate(-19.921 27.416 129.993)"
               fill="#F1F8FF"
            />
            <path
               d="M69.844 82.707a4 4 0 012.397-5.123l38.273-13.871a4.001 4.001 0 013.261.24l10.834 5.837a4 4 0 005.669-2.187l3.853-10.895a4.002 4.002 0 012.409-2.427l39.119-14.178a4 4 0 015.124 2.398l12.947 35.726a4 4 0 01-2.397 5.124L87.915 120.83a4 4 0 01-5.124-2.398L69.844 82.707z"
               fill="#DEE41A"
            />
            <circle
               cx="123.95"
               cy="58.843"
               r="12"
               transform="rotate(-19.921 123.95 58.843)"
               stroke="#233446"
               strokeWidth="8"
            />
            <path
               d="M78.027 178.66l90.256-32.71M89.612 210.626l157.007-56.902M101.878 244.472l122.221-44.295M142.425 356.351l51.709-18.74"
               stroke="#233446"
               strokeWidth="10"
               strokeLinecap="round"
            />
            <rect
               x="153"
               y="69"
               width="252"
               height="325"
               rx="14"
               fill="#233446"
            />
            <rect
               x="164"
               y="83"
               width="230"
               height="297"
               rx="14"
               fill="#F1F8FF"
            />
            <path
               d="M220 53a4 4 0 014-4h40.709a4 4 0 012.984 1.336l8.197 9.18a4 4 0 006.074-.125l7.336-8.93A4 4 0 01292.391 49H334a4 4 0 014 4v38a4 4 0 01-4 4H224a4 4 0 01-4-4V53z"
               fill="#DEE41A"
            />
            <circle cx="279" cy="49" r="12" stroke="#233446" strokeWidth="8" />
            <path
               d="M195 146h96M195 180h167M195 216h130M195 335h55"
               stroke="#233446"
               strokeWidth="10"
               strokeLinecap="round"
            />
         </g>
         <defs>
            <clipPath id="clip0">
               <path
                  fill="#fff"
                  transform="translate(.038 .869)"
                  d="M0 0h404.962v425.262H0z"
               />
            </clipPath>
         </defs>
      </svg>
   )
}
