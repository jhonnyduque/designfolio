import React from "react";
import Image from "next/image";
import avatar from '@/assets/img/inner-blog/blog-details/avatar/avatar-1.jpg'
import Link from "next/link";

export default function BlogDetailsAuthor() {
  return (
    <div className="blog-details-author d-flex mb-60">
      <div className="blog-details-author-img">
        <Image
          style={{ width: "100%", height: "auto" }}
          src={avatar}
          alt=""
        />
      </div>
      <div className="blog-details-author-content-wrap">
        <div className="blog-details-author-social text-end">
          <Link href="#">
            <i className="fab fa-facebook-f"></i>
          </Link>
          <Link href="#">
            <i className="fab fa-twitter"></i>
          </Link>
          <Link href="#">
            <i className="fab fa-linkedin-in"></i>
          </Link>
        </div>
        <div className="blog-details-author-content">
          <h4 className="blog-details-author-title">Lea Cohen</h4>
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor.!
          </p>
        </div>
      </div>
    </div>
  );
}
