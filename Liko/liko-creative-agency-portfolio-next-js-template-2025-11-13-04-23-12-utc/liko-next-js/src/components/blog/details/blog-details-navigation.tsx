import Link from "next/link";
import React from "react";

export default function BlogDetailsNavigation() {
  return (
    <div className="blog-details-navigation-style mb-120">
      <div className="project-details-1-navigation d-flex justify-content-between align-items-center">
        <Link className="project-details-1-prev" href="#">
          <i className="fa-sharp fa-regular fa-arrow-left"></i>
          <span>Prev</span>
        </Link>
        <Link href="#">
          <span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="17" cy="3" r="3" fill="#19191A"/>
              <circle cx="3" cy="3" r="3" fill="#19191A"/>
              <circle cx="3" cy="17" r="3" fill="#19191A"/>
              <circle cx="17" cy="17" r="3" fill="#19191A"/>
            </svg>
          </span>
        </Link>
        <Link className="project-details-1-next" href="#">
          <span>Next</span>
          <i className="fa-sharp fa-regular fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
}
