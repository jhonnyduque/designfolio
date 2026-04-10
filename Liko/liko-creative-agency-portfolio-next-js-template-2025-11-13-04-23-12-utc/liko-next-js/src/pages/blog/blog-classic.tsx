"use client";
import { ScrollSmoother, ScrollTrigger, SplitText } from "@/plugins";
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
import useScrollSmooth from "@/hooks/use-scroll-smooth";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import React from "react";

// internal imports
import Wrapper from "@/layouts/wrapper";
import HeaderEleven from "@/layouts/headers/header-eleven";
import FooterTwo from "@/layouts/footers/footer-two";
// animation
import { charAnimation } from "@/utils/title-animation";
import BlogClassicSlider from "@/components/blog/slider/blog-classic-slider";
import BlogClassicArea from "@/components/blog/blog-classic-area";

const BlogClassicMain = () => {
  useScrollSmooth();

  useGSAP(() => {
    const timer = setTimeout(() => {
      charAnimation();
    }, 100);
    return () => clearTimeout(timer);
  });

  return (
    <Wrapper>
      {/* header area start */}
      <HeaderEleven transparent={true} />
      {/* header area end */}

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            {/* blog classic hero start */}
            <BlogClassicSlider />
            {/* blog classic hero end */}

            {/* blog classic area area */}
            <BlogClassicArea />
            {/* blog classic area area */}
          </main>

          {/* footer area */}
          <FooterTwo topCls="" />
          {/* footer area */}
        </div>
      </div>
    </Wrapper>
  );
};

export default BlogClassicMain;
