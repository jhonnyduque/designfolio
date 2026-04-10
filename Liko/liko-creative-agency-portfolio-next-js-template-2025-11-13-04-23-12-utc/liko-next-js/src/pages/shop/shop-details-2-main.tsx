"use client";
import { gsap } from "gsap";
import React from "react";
import useScrollSmooth from "@/hooks/use-scroll-smooth";
import { ScrollSmoother, ScrollTrigger, SplitText } from "@/plugins";
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

// internal imports
import Wrapper from "@/layouts/wrapper";
import HeaderTwelve from "@/layouts/headers/header-twelve";
import ShopDetailsAreaTwo from "@/components/shop/details/shop-details-area-2";
import ShopDetailsBottomArea from "@/components/shop/details/shop-details-bottom-area";
import FooterSix from "@/layouts/footers/footer-six";

const ShopDetailsTwoMain = () => {
  useScrollSmooth();

  return (
    <Wrapper>
      {/* header area start */}
      <HeaderTwelve />
      {/* header area end */}

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            {/* shop details */}
            <ShopDetailsAreaTwo />
            {/* shop details */}

            {/* shop details area */}
            <ShopDetailsBottomArea/>
            {/* shop details area */}
          </main>

          {/* footer area */}
          <FooterSix />
          {/* footer area */}
        </div>
      </div>
    </Wrapper>
  );
};

export default ShopDetailsTwoMain;
