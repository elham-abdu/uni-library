import React from "react";

interface Props {
  color?: string;
}

const BookCoverSvg = ({ color = "#012B48" }: Props) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 584 704"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0H584V704H0V0Z"
        fill={color}
      />
    </svg>
  );
};

export default BookCoverSvg;