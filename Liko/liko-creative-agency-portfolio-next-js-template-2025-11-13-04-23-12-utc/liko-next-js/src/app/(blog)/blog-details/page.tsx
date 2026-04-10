import React from "react";
import { Metadata } from "next";
import BlogDetailsMain from "@/pages/blog/blog-details";

export const metadata: Metadata = {
  title: "Liko - Blog Classic page",
};

const BlogDetailsPage = () => {
  return (
    <BlogDetailsMain id={1} />
  );
};

export default BlogDetailsPage;
